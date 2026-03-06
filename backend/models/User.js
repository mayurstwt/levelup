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
    rate: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
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
