const User = require('../models/User');
const Job = require('../models/Job');

const adminOnly = (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: Admins only' });
        return false;
    }
    return true;
};

// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/admin/dispute
exports.resolveDispute = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;
        const { jobId, resolution } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'disputed') return res.status(400).json({ message: 'Job is not under dispute' });
        if (!['refund_buyer', 'pay_seller'].includes(resolution)) {
            return res.status(400).json({ message: 'Invalid resolution. Use refund_buyer or pay_seller' });
        }
        job.status = 'completed';
        const Transaction = require('../models/Transaction');

        if (resolution === 'refund_buyer') {
            await Transaction.findOneAndUpdate({ jobId: job._id }, { status: 'refunded' });
        } else if (resolution === 'pay_seller') {
            const Ledger = require('../models/Ledger');
            const tx = await Transaction.findOne({ jobId: job._id, status: 'paid' });
            if (tx && job.sellerId) {
                const payoutAmount = tx.amount - tx.platformFee;
                await Ledger.findOneAndUpdate(
                    { userId: job.sellerId },
                    { $inc: { availableBalance: payoutAmount, totalEarned: payoutAmount } },
                    { upsert: true, new: true }
                );
            }
        }

        await job.save();
        res.json({ message: `Dispute resolved: ${resolution}`, job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban an admin user' });
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/admin/users/:id/kyc
exports.approveKYC = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { 'kyc.status': status }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `KYC ${status}`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
