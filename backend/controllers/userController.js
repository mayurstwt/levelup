const User = require('../models/User');
const Job = require('../models/Job');
const Review = require('../models/Review');

// @route   GET /api/users/sellers
// @desc    Get list of sellers (can filter by game/rating)
// @access  Public
exports.getSellers = async (req, res) => {
    try {
        const { game, minRating } = req.query;
        let query = { role: 'seller' };

        if (game) query.games = { $regex: new RegExp(game, 'i') };
        if (minRating) query.rating = { $gte: Number(minRating) };

        const sellers = await User.find(query).select('-password -kyc');
        res.json(sellers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/users/:id/profile
// @desc    Get public profile for a user (seller or buyer)
// @access  Public
exports.getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -kyc -email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [completedJobs, reviews] = await Promise.all([
            Job.countDocuments({
                $or: [{ buyerId: user._id }, { sellerId: user._id }],
                status: 'completed',
            }),
            Review.find({ revieweeId: user._id })
                .populate('reviewerId', ['name'])
                .sort({ createdAt: -1 })
                .limit(20),
        ]);

        res.json({ user, completedJobs, reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/users/me
// @desc    Update user profile (bio, games, rate)
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, games, rate } = req.body;

        const profileFields = {};
        if (name) profileFields.name = name;
        if (bio !== undefined) profileFields.bio = bio;
        if (games) {
            profileFields.games = Array.isArray(games) ? games : games.split(',').map(g => g.trim());
        }
        if (rate !== undefined) profileFields.rate = Number(rate);

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/users/kyc
// @desc    Submit KYC documents (PAN / Aadhaar)
// @access  Private
exports.submitKYC = async (req, res) => {
    try {
        const { pan, aadhaar } = req.body;
        if (!pan && !aadhaar) {
            return res.status(400).json({ message: 'Provide PAN or Aadhaar number' });
        }

        const update = {};
        if (pan) update['kyc.pan'] = pan;
        if (aadhaar) update['kyc.aadhaar'] = aadhaar;
        update['kyc.status'] = 'pending';

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true }
        ).select('-password');

        res.json({ message: 'KYC submitted successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
