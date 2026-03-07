const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'upi', 'paypal', 'crypto'],
        required: true
    },
    payoutDetails: { type: String, required: true }, // e.g. UPI ID, bank account, wallet address
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    adminNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
