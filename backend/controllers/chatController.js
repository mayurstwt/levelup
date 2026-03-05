const Chat = require('../models/Chat');
const Job = require('../models/Job');

// @route   GET /api/chats/:jobId
// @desc    Get chat history for a job
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Verify user has access to this job's chat
        const job = await Job.findById(jobId);
        if (!job) {
             return res.status(404).json({ message: 'Job not found' });
        }

        if (job.buyerId.toString() !== req.user.id && job.sellerId?.toString() !== req.user.id && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        let chat = await Chat.findOne({ jobId }).populate('messages.senderId', ['name']);
        
        if (!chat) {
            // If no chat document exists yet, create an empty one
            chat = new Chat({
                jobId,
                participants: [job.buyerId, job.sellerId].filter(id => id), // Filter out undefined if sellerId not set yet
                messages: []
            });
            await chat.save();
        }

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
