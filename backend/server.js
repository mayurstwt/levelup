const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { cleanEnv, str, port, url } = require('envalid');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Validate Environment Variables Strictly
const env = cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    MONGO_URI: str(),
    JWT_SECRET: str(),
    POLAR_API_KEY: str({ default: '' }), // Allows fallback if missing, though warned
    POLAR_WEBHOOK_SECRET: str({ default: '' }),
    FRONTEND_URL: url({ default: 'http://localhost:5173' })
});

const app = express();
const server = http.createServer(app);

// CORS configuration (allow requests from our Vite dev server)
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Security Headers
app.use(helmet());

// Webhook needs raw body, so we conditionally apply express.json
app.use((req, res, next) => {
    if (req.originalUrl === '/api/polar/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Express 5 makes req.query a getter-only property. 
// express-mongo-sanitize modifies it by assignment, crashing the app.
// This allows the assignment to succeed on the request instance.
app.use((req, res, next) => {
    if (req.query) {
        Object.defineProperty(req, 'query', {
            value: req.query,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    next();
});

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per `window`
    message: 'Too many requests from this IP, please try again later.',
});
// Auth-specific stricter rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again later.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/change-password', authLimiter);

app.use('/api', limiter);


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/polar', require('./routes/polar'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/reports', require('./routes/reports'));

// Simple local upload route for media
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const protect = require('./middleware/auth');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error('Only image files are allowed (.jpg, .jpeg, .png, .webp, .gif)'));
        }
        cb(null, true);
    }
});

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

app.post('/api/upload', protect, upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    res.json({ fileUrl });
});

// Start cron jobs
require('./jobs/expireJobs');
require('./jobs/syncSubscriptions')();
require('./jobs/autoCompleteJobs')();
require('./jobs/autoCancelAbandonedJobs')();
require('./jobs/autoEscalateDisputes')();



// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.io Setup
const io = new Server(server, {
    cors: corsOptions
});

const Chat = require('./models/Chat');
const notify = require('./utils/notify');

// Initialize the notify utility so controllers can call notifyUser without circular deps
notify.init(io);

// Map userId -> socketId for targeted notifications — now managed by utils/notify.js
const onlineUsers = new Set(); // Track online userIds for presence feature

io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    // Register user <-> socket mapping for notifications
    socket.on('register', (userId) => {
        notify.registerSocket(userId, socket.id);
        socket.userId = userId; // store on socket for cleanup
        onlineUsers.add(userId);
        io.emit('userOnline', userId);
        logger.debug(`User ${userId} registered with socket ${socket.id}`);
    });

    // Join a specific chat room based on Job ID
    socket.on('joinChat', (jobId) => {
        socket.join(jobId);
        logger.debug(`User joined chat room: ${jobId}`);
    });

    // Broadcast typing indicator to others in the room (#29)
    socket.on('typing', ({ jobId, senderId }) => {
        socket.to(jobId).emit('typing', { senderId });
    });

    // Send and save message
    socket.on('sendMessage', async (data) => {
        try {
            const { jobId, senderId, text, mediaUrl } = data;
            const Job = require('./models/Job');

            // Hard check: Ensure sender is either buyer or seller of this job
            const job = await Job.findById(jobId);
            if (!job || (job.buyerId.toString() !== senderId && job.sellerId?.toString() !== senderId)) {
                return console.error(`Unauthorized chat attempt to job ${jobId} from ${senderId}`);
            }

            // Prevent chat before job is at least matched
            const CHAT_ALLOWED_STATUSES = ['matched', 'in_progress', 'review_pending', 'completed', 'disputed'];
            if (!CHAT_ALLOWED_STATUSES.includes(job.status)) {
                return socket.emit('chatError', { message: 'Chat is only available after a bid has been accepted.' });
            }

            // Save to DB
            let chat = await Chat.findOne({ jobId });
            if (!chat) {
                chat = new Chat({ jobId, messages: [] });
            }

            const newMessage = {
                senderId,
                text: text || '',
                mediaUrl: mediaUrl || null,
                readBy: [senderId], // Sender has read it
                timestamp: Date.now()
            };

            chat.messages.push(newMessage);
            await chat.save();

            // Emit to everyone in the room
            io.to(jobId).emit('newMessage', newMessage);
        } catch (err) {
            logger.error('Socket error saving message:', err.message);
        }
    });

    // Mark messages as read
    socket.on('markAsRead', async ({ jobId, userId }) => {
        try {
            let chat = await Chat.findOne({ jobId });
            if (chat) {
                let updated = false;
                chat.messages.forEach(msg => {
                    if (msg.senderId.toString() !== userId && !msg.readBy.includes(userId)) {
                        msg.readBy.push(userId);
                        updated = true;
                    }
                });

                if (updated) {
                    await chat.save();
                    io.to(jobId).emit('messagesRead', { jobId, userId });
                }
            }
        } catch (err) {
            logger.error('Socket error marking read:', err.message);
        }
    });

    socket.on('disconnect', () => {
        notify.removeSocket(socket.id);
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('userOffline', socket.userId);
        }
        logger.debug(`Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/level_up';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        logger.info('MongoDB connected successfully');
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error.message);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
