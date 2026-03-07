const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    discordId: { type: String, required: false, unique: true, sparse: true },
    googleId: { type: String, required: false, unique: true, sparse: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    name: { type: String, required: true },
    bio: { type: String, default: '' },
    games: [{ type: String }],
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    topRated: { type: Boolean, default: false },
    completedJobs: { type: Number, default: 0 },
    responseTime: { type: String, default: '1 Hour' },
    portfolio: [{
        title: { type: String, required: true },
        imageUrl: { type: String },
        link: { type: String }
    }],
    stripeAccountId: { type: String },
    subscription: {
        type: String,
        enum: ['none', 'buyer_pro', 'buyer_elite', 'seller_pro', 'seller_elite'],
        default: 'none'
    },
    isBanned: { type: Boolean, default: false },
    kyc: {
        pan: { type: String, select: false },
        aadhaar: { type: String, select: false },
        status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' }
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
