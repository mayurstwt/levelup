const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');

// Returns the platform fee rate based on seller's subscription tier
const getPlatformFee = (subscription) => {
    if (subscription === 'seller_elite') return 0.05;
    if (subscription === 'seller_pro') return 0.08;
    return 0.15; // free tier default
};

// Middleware: Buyers on free plan can only have 2 open jobs per calendar month
const buyerJobLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('subscription role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Only enforce on free-tier buyers
        if (user.subscription === 'buyer_pro' || user.subscription === 'buyer_elite') {
            return next();
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const count = await Job.countDocuments({
            buyerId: req.user.id,
            createdAt: { $gte: startOfMonth },
        });

        if (count >= 2) {
            return res.status(403).json({
                message: 'Free plan allows only 2 job posts per month. Upgrade to Commander or Warlord for unlimited posts.',
                code: 'JOB_LIMIT_REACHED',
            });
        }

        next();
    } catch (err) {
        console.error('buyerJobLimit error:', err.message);
        res.status(500).send('Server error');
    }
};

// Middleware: Sellers on free plan can only bid 5 times per calendar month
const sellerBidLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('subscription role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Only enforce on free-tier sellers
        if (user.subscription === 'seller_pro' || user.subscription === 'seller_elite') {
            return next();
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const count = await Bid.countDocuments({
            sellerId: req.user.id,
            createdAt: { $gte: startOfMonth },
        });

        if (count >= 5) {
            return res.status(403).json({
                message: 'Free plan allows only 5 bids per month. Upgrade to Champion or Legend for unlimited bids.',
                code: 'BID_LIMIT_REACHED',
            });
        }

        next();
    } catch (err) {
        console.error('sellerBidLimit error:', err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { buyerJobLimit, sellerBidLimit, getPlatformFee };
