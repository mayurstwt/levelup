const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');
const { getPlatformFee } = require('../middleware/checkTier');

// @route   POST /api/bids
// @desc    Submit a bid for a job
// @access  Private (Seller only)
exports.submitBid = async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can submit bids' });
        }
        const { jobId, bidAmount, message } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for bidding' });

        const existingBid = await Bid.findOne({ jobId, sellerId: req.user.id });
        if (existingBid) return res.status(400).json({ message: 'You have already placed a bid on this job' });

        if (bidAmount > job.budget * 5) return res.status(400).json({ message: `Bid amount cannot exceed 5× the job budget ($${job.budget * 5})` });

        const bid = await new Bid({ jobId, bidAmount, message, sellerId: req.user.id }).save();

        try {
            const { notifyUser } = require('../server');
            notifyUser(job.buyerId, { type: 'bid', jobId: job._id, message: `New bid of ₹${bidAmount} received on "${job.title}"` });
        } catch (_) { }

        res.status(201).json(bid);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/bids/mine
// @desc    Get logged-in seller's own bids with job details
// @access  Private (Seller only)
exports.getMyBids = async (req, res) => {
    try {
        if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can view their bids' });
        const bids = await Bid.find({ sellerId: req.user.id })
            .populate('jobId', ['title', 'game', 'budget', 'status', 'buyerId'])
            .sort({ createdAt: -1 });
        res.json(bids);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/bids/job/:jobId
// @desc    Get all bids for a specific job
// @access  Private (Job owner or Admin)
exports.getJobBids = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these bids' });
        }
        const bids = await Bid.find({ jobId: req.params.jobId }).populate('sellerId', ['name', 'rating', 'games', 'subscription']);
        res.json(bids);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/bids/:id/accept
// @desc    Accept a bid — tiered platform fee applied
// @access  Private (Job owner only)
exports.acceptBid = async (req, res) => {
    const session = await Bid.startSession();
    session.startTransaction();
    try {
        const bid = await Bid.findById(req.params.id).session(session);
        if (!bid) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Bid not found' });
        }

        const job = await Job.findById(bid.jobId).session(session);
        if (job.buyerId.toString() !== req.user.id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'User not authorized' });
        }
        if (job.status !== 'open') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Job is already matched or closed' });
        }

        bid.status = 'accepted';
        await bid.save({ session });

        await Bid.updateMany({ jobId: job._id, _id: { $ne: bid._id } }, { $set: { status: 'rejected' } }, { session });

        job.status = 'pending_payment';
        job.sellerId = bid.sellerId;
        await job.save({ session });

        await session.commitTransaction();
        session.endSession();

        const seller = await User.findById(bid.sellerId).select('subscription');
        const feeRate = getPlatformFee(seller?.subscription || 'none');

        res.json({ bid, job, platformFeeRate: feeRate });

        try {
            const { notifyUser } = require('../server');
            notifyUser(bid.sellerId, { type: 'accepted', jobId: job._id, message: `🎉 Your bid was accepted for "${job.title}"! Waiting for buyer to deposit funds.` });
        } catch (_) { }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   DELETE /api/bids/:id
// @desc    Seller withdraws their own pending bid
// @access  Private (Seller only)
exports.withdrawBid = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id);
        if (!bid) return res.status(404).json({ message: 'Bid not found' });
        if (bid.sellerId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to withdraw this bid' });
        if (bid.status !== 'pending') return res.status(400).json({ message: 'Only pending bids can be withdrawn' });
        await bid.deleteOne();
        res.json({ message: 'Bid withdrawn successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
