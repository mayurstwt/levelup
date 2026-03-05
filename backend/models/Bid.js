const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bidAmount: { type: Number, required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
