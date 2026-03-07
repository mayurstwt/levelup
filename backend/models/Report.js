const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // Optional (if reporting a job)
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional (if reporting a user)
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    adminNote: { type: String },
}, { timestamps: true });

// Index for getting pending reports quickly
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
