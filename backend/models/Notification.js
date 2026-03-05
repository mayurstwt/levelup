const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['bid', 'accepted', 'message', 'completed', 'payment', 'dispute', 'system'], default: 'system' },
    message: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
