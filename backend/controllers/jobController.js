const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { notifyUser } = require('../server');


// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Buyer only)
exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'buyer') {
            return res.status(403).json({ message: 'Only buyers can create jobs' });
        }

        const { title, description, game, budget, timeline, serviceType } = req.body;

        const newJob = new Job({
            title,
            description,
            game,
            serviceType: serviceType || '',
            budget,
            timeline,
            buyerId: req.user.id
        });

        const job = await newJob.save();
        res.status(201).json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// @route   GET /api/jobs
// @desc    Get all open jobs (with optional filters, sort, pagination)
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const { game, serviceType, budgetMin, budgetMax, search, sortBy, page = 1, limit = 12 } = req.query;
        let query = { status: 'open' };

        // Full-text search (uses MongoDB text index)
        if (search) {
            query.$text = { $search: search };
        } else if (game) {
            query.game = { $regex: new RegExp(game, 'i') };
        }

        if (serviceType) query.serviceType = { $regex: new RegExp(serviceType, 'i') };
        if (budgetMin || budgetMax) {
            query.budget = {};
            if (budgetMin) query.budget.$gte = Number(budgetMin);
            if (budgetMax) query.budget.$lte = Number(budgetMax);
        }

        // Sort mapping
        const sortMap = {
            budget_high: { budget: -1 },
            budget_low: { budget: 1 },
            deadline: { timeline: 1 },
            newest: { createdAt: -1 },
        };
        const sort = sortMap[sortBy] || { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('buyerId', ['name', 'rating'])
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Job.countDocuments(query),
        ]);

        // Attach bid count to each job
        const jobIds = jobs.map(j => j._id);
        const bidCounts = await Bid.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            { $group: { _id: '$jobId', count: { $sum: 1 } } },
        ]);
        const bidCountMap = {};
        bidCounts.forEach(b => { bidCountMap[b._id.toString()] = b.count; });

        const jobsWithBids = jobs.map(j => ({
            ...j.toObject(),
            bidCount: bidCountMap[j._id.toString()] || 0,
        }));

        res.json({ jobs: jobsWithBids, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/bids/job/:jobId
// @desc    Get all bids for a job (buyer/admin) OR seller's own bid for a job (seller)
// (This is in jobController but serves bidding, accessed via bids router)
// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('buyerId', ['name', 'rating'])
            .populate('sellerId', ['name', 'rating']);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/jobs/:id
// @desc    Update an open job
// @access  Private (Buyer only, owner of the job)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to edit this job' });
        }

        if (job.status !== 'open') {
            return res.status(400).json({ message: 'Only open jobs can be edited' });
        }

        const { title, description, budget, timeline } = req.body;
        if (title) job.title = title;
        if (description) job.description = description;
        if (budget) job.budget = budget;
        if (timeline) job.timeline = timeline;

        await job.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/jobs/:id/match
// @desc    Match/Assign a seller to a job
// @access  Private (Buyer only, owner of the job)
exports.matchJob = async (req, res) => {
    try {
        const { sellerId } = req.body;
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check user
        if (job.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        if (job.status !== 'open') {
            return res.status(400).json({ message: 'Job is not open for matching' });
        }

        job.sellerId = sellerId;
        job.status = 'matched';

        await job.save();

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getUserJobs = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'buyer') {
            query.buyerId = req.user.id;
        } else if (req.user.role === 'seller') {
            query.sellerId = req.user.id;
        } else {
            return res.status(403).json({ message: 'Invalid role for fetching user jobs' });
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json({ jobs, total: jobs.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

// @route   PUT /api/jobs/:id/start
// @desc    Seller starts the job
// @access  Private (Seller only)
exports.startJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.sellerId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the assigned seller can start this job' });
        }

        if (job.status !== 'matched') {
            return res.status(400).json({ message: 'Job must be matched to start' });
        }

        job.status = 'in_progress';
        await job.save();

        const { notifyUser } = require('../server');
        try {
            notifyUser(job.buyerId, {
                type: 'message',
                jobId: job._id,
                message: `🚀 Seller has started working on "${job.title}".`
            });
        } catch (_) { }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/jobs/:id/request-completion
// @desc    Seller requests completion of a job
// @access  Private (Seller only)
exports.requestCompletion = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.sellerId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the assigned seller can request completion' });
        }

        if (job.status !== 'in_progress') {
            return res.status(400).json({ message: 'Job must be in progress to request completion' });
        }

        job.status = 'review_pending';
        // We can use the updatedAt timestamp for the auto-complete cron
        await job.save();

        const { notifyUser } = require('../server');
        try {
            notifyUser(job.buyerId, {
                type: 'review_pending',
                jobId: job._id,
                message: `Seller has finished "${job.title}". Please review and approve to release funds.`,
            });
        } catch (_) { }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/jobs/:id/complete
// @desc    Buyer marks job as completed
// @access  Private (Buyer only)
exports.completeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the buyer can complete a job' });
        }

        if (job.status !== 'review_pending' && job.status !== 'in_progress' && job.status !== 'matched') {
            return res.status(400).json({ message: 'Job is not in a valid state to be completed' });
        }

        job.status = 'completed';
        await job.save();

        // Release funds to seller ledger
        const Transaction = require('../models/Transaction');
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

        // Notify the seller that job was marked complete
        const { notifyUser } = require('../server');
        try {
            if (job.sellerId) {
                notifyUser(job.sellerId, {
                    type: 'completed',
                    jobId: job._id,
                    message: `✅ Job "${job.title}" has been completed by the buyer. Escrow funds released to your wallet!`,
                });
            }
        } catch (_) { }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/jobs/:id/dispute
// @desc    Buyer raises a dispute
// @access  Private (Buyer only)
exports.raiseDispute = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the buyer can raise a dispute' });
        }

        if (job.status !== 'matched') {
            return res.status(400).json({ message: 'Job must be matched to raise a dispute' });
        }

        job.status = 'disputed';
        await job.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   DELETE /api/jobs/:id
// @desc    Buyer deletes their own open job
// @access  Private (Buyer only)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        if (['matched', 'in_progress', 'disputed', 'completed'].includes(job.status)) {
            return res.status(400).json({ message: 'Cannot delete a job that is already matched, in progress, or disputed' });
        }
        if (job.status !== 'open') {
            return res.status(400).json({ message: 'Only open jobs can be deleted' });
        }

        await Bid.deleteMany({ jobId: job._id });
        await job.deleteOne();

        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
