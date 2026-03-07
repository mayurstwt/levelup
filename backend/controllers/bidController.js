const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getPlatformFee } = require('../middleware/checkTier');
const { notifyUser } = require('../utils/notify');
const logger = require('../utils/logger');

// Retry helper for transient MongoDB session/network errors
const withRetry = async (fn, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const result = await fn(session);
            await session.commitTransaction();
            return result;
        } catch (err) {
            await session.abortTransaction();
            const isTransient = err.errorLabels?.includes('TransientTransactionError') ||
                err.errorLabels?.includes('UnknownTransactionCommitResult');
            if (isTransient && attempt < maxRetries) {
                logger.warn(`Transaction transient error, retrying (attempt ${attempt})...`);
                await new Promise(r => setTimeout(r, 100 * attempt));
            } else {
                throw err;
            }
        } finally {
            session.endSession();
        }
    }
};

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

        // Prevent seller from bidding on their own job (if they somehow have both roles historically)
        if (job.buyerId.toString() === req.user.id) {
            return res.status(403).json({ message: 'You cannot bid on your own job' });
        }

        const existingBid = await Bid.findOne({ jobId, sellerId: req.user.id });
        if (existingBid) return res.status(400).json({ message: 'You have already placed a bid on this job' });

        if (bidAmount > job.budget * 5) return res.status(400).json({ message: `Bid amount cannot exceed 5× the job budget ($${job.budget * 5})` });

        const bid = await new Bid({ jobId, bidAmount, message, sellerId: req.user.id }).save();

        notifyUser(job.buyerId, { type: 'bid', jobId: job._id, message: `New bid of $${bidAmount} received on "${job.title}"` });

        res.status(201).json(bid);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/bids/:id/accept
// @desc    Accept a bid — tiered platform fee applied
// @access  Private (Job owner only)
exports.acceptBid = async (req, res) => {
    try {
        const { bid, job, feeRate } = await withRetry(async (session) => {
            const bid = await Bid.findById(req.params.id).session(session);
            if (!bid) throw Object.assign(new Error('Bid not found'), { statusCode: 404 });

            const job = await Job.findById(bid.jobId).session(session);
            if (job.buyerId.toString() !== req.user.id)
                throw Object.assign(new Error('User not authorized'), { statusCode: 403 });
            if (job.status !== 'open')
                throw Object.assign(new Error('Job is already matched or closed'), { statusCode: 400 });

            bid.status = 'accepted';
            await bid.save({ session });

            await Bid.updateMany(
                { jobId: job._id, _id: { $ne: bid._id } },
                { $set: { status: 'rejected' } },
                { session }
            );

            job.status = 'pending_payment';
            job.sellerId = bid.sellerId;
            await job.save({ session });

            const seller = await User.findById(bid.sellerId).select('subscription').session(session);
            const feeRate = getPlatformFee(seller?.subscription || 'none');
            return { bid, job, feeRate };
        });

        res.json({ bid, job, platformFeeRate: feeRate });
        notifyUser(bid.sellerId, { type: 'accepted', jobId: job._id, message: `🎉 Your bid was accepted for "${job.title}"! Waiting for buyer to deposit funds.` });
    } catch (err) {
        logger.error('acceptBid error:', err.message);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/bids/:id/counter
// @desc    Propose a counter-offer to a bid
// @access  Private (Seller or Buyer)
exports.counterOffer = async (req, res) => {
    try {
        const { amount, message } = req.body;
        const bid = await Bid.findById(req.params.id).populate('jobId');

        if (!bid) return res.status(404).json({ message: 'Bid not found' });
        if (bid.status !== 'pending' && bid.status !== 'countered') {
            return res.status(400).json({ message: 'Can only counter pending or countered bids' });
        }

        const isBuyer = bid.jobId.buyerId.toString() === req.user.id;
        const isSeller = bid.sellerId.toString() === req.user.id;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: 'Not authorized to counter this bid' });
        }

        bid.status = 'countered';
        bid.counter = {
            amount: Number(amount),
            message: message || '',
            proposedBy: isBuyer ? 'buyer' : 'seller'
        };

        await bid.save();

        const notifyId = isBuyer ? bid.sellerId : bid.jobId.buyerId;
        const proposerName = isBuyer ? 'Buyer' : 'Seller';
        notifyUser(notifyId, {
            type: 'bid',
            jobId: bid.jobId._id,
            message: `${proposerName} countered your bid on "${bid.jobId.title}" with $${amount}.`
        });

        res.json(bid);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/bids/:id/counter/accept
// @desc    Accept a counter-offer
// @access  Private (Seller or Buyer, whoever did NOT propose the counter)
exports.acceptCounterOffer = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id).populate('jobId');

        if (!bid || bid.status !== 'countered' || !bid.counter) {
            return res.status(400).json({ message: 'No counter-offer to accept' });
        }

        const isBuyer = bid.jobId.buyerId.toString() === req.user.id;
        const isSeller = bid.sellerId.toString() === req.user.id;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: 'Not authorized to accept this counter' });
        }

        if ((isBuyer && bid.counter.proposedBy === 'buyer') || (isSeller && bid.counter.proposedBy === 'seller')) {
            return res.status(400).json({ message: 'You cannot accept your own counter-offer' });
        }

        // Update the main bid amount to match the counter amount
        bid.bidAmount = bid.counter.amount;
        bid.message = bid.counter.message ? `[Counter Accepted] ${bid.counter.message}` : `[Counter Accepted]`;

        // At this point, it's just a normal accepted bid.
        // If the buyer is accepting the seller's counter, it goes straight to pending_payment.
        // If the seller is accepting the buyer's counter, the buyer STILL needs to actually "acceptBid" 
        // to initiate the stripe checkout. So we just set it back to pending with the new amount.

        if (isBuyer) {
            // Buyer accepts seller's counter -> effectively acts as "accepting the bid"
            bid.status = 'accepted';
            bid.jobId.status = 'pending_payment';
            bid.jobId.sellerId = bid.sellerId;

            // Reject other bids
            await Bid.updateMany(
                { jobId: bid.jobId._id, _id: { $ne: bid._id } },
                { $set: { status: 'rejected' } }
            );

            await bid.jobId.save();
        } else {
            // Seller accepts buyer's counter -> bid becomes a regular pending bid at the new price
            bid.status = 'pending';
        }

        // Clear the counter block now that it's resolved
        bid.counter = undefined;
        await bid.save();

        const notifyId = isBuyer ? bid.sellerId : bid.jobId.buyerId;
        const acceptorName = isBuyer ? 'Buyer' : 'Seller';
        notifyUser(notifyId, {
            type: 'accepted',
            jobId: bid.jobId._id,
            message: `${acceptorName} accepted your counter-offer for "${bid.jobId.title}"!`
        });

        res.json(bid);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
