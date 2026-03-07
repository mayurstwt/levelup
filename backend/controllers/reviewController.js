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

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Number(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ revieweeId: req.params.userId })
                .populate('reviewerId', ['name'])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ revieweeId: req.params.userId }),
        ]);

        res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
