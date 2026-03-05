const Transaction = require('../models/Transaction');
const Job = require('../models/Job');

// @route   POST /api/payments/create
// @desc    Initiate a mock payment
// @access  Private (Buyer only)
exports.createPayment = async (req, res) => {
    try {
        const { jobId } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
             return res.status(404).json({ message: 'Job not found' });
        }

        if (job.buyerId.toString() !== req.user.id) {
             return res.status(403).json({ message: 'Not authorized' });
        }

        if (job.status !== 'matched') {
            return res.status(400).json({ message: 'Job is not ready for payment' });
        }

        // Mocking Instamojo response
        const platformFee = job.budget * 0.15;
        const totalAmount = job.budget + platformFee;

        // Create transaction record
        const transaction = new Transaction({
            jobId: job._id,
            amount: job.budget,
            platformFee: platformFee,
            status: 'pending',
            paymentId: 'mock_tx_' + Date.now() // Mock Payment ID
        });

        await transaction.save();

        // Normally, we would return a payment URL here from Instamojo
        res.json({
            message: 'Payment mock initiated',
            transactionId: transaction._id,
            totalAmount,
            mockPaymentUrl: `http://localhost:5173/mock-checkout/${transaction._id}`
        });

    } catch (err) {
         console.error(err.message);
         res.status(500).send('Server error');
    }
};

// @route   POST /api/payments/webhook
// @desc    Mock Webhook to handle successful payment
// @access  Public (Mocked)
exports.webhook = async (req, res) => {
    try {
        const { transactionId, status } = req.body; // In real life, verify Instamojo signature

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (status === 'success') {
            transaction.status = 'paid';
            await transaction.save();

            // Might also update job status here, e.g. to "in progress"
        }

        res.json({ message: 'Webhook processed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/payments/history
// @desc    Get transaction history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        // Fetch all transactions involving jobs owned by this user (buyer view)
        // For standard MVP, we'll just return user's distinct transactions (needs improvement if seller needs ledger)
        // To simplify, let's fetch jobs where user is buyer or seller
        const userJobs = await Job.find({
            $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }]
        });

        const jobIds = userJobs.map(job => job._id);

        const transactions = await Transaction.find({ jobId: { $in: jobIds } }).populate('jobId', ['title', 'status']);
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
