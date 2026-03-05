const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');

// @route   POST /api/reviews
// @desc    Submit a review (buyer ↔ seller after job completed)
// @access  Private
exports.submitReview = async (req, res) => {
    try {
        const { jobId, rating, comment } = req.body;

        if (!jobId || !rating) {
            return res.status(400).json({ message: 'jobId and rating are required' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed jobs' });
        }

        const userId = req.user.id;
        const isBuyer = job.buyerId.toString() === userId;
        const isSeller = job.sellerId?.toString() === userId;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: 'Not authorized to review this job' });
        }

        // Determine who is being reviewed
        const revieweeId = isBuyer ? job.sellerId : job.buyerId;

        // Prevent double review
        const existing = await Review.findOne({ jobId, reviewerId: userId });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this job' });
        }

        const review = new Review({
            jobId,
            reviewerId: userId,
            revieweeId,
            rating: Number(rating),
            comment: comment || '',
        });

        await review.save();

        // Recalculate reviewee average rating
        const allReviews = await Review.find({ revieweeId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avgRating * 10) / 10,
            ratingCount: allReviews.length,
        });

        const populated = await review.populate('reviewerId', ['name']);
        res.status(201).json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ revieweeId: req.params.userId })
            .populate('reviewerId', ['name'])
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
