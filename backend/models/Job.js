const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    game: { type: String, required: true },
    serviceType: { type: String, default: '' },
    budget: { type: Number, required: true },
    timeline: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'pending_payment', 'matched', 'in_progress', 'review_pending', 'completed', 'disputed', 'expired'],
        default: 'open'
    },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
}, { timestamps: true });

// Full-text search index
jobSchema.index({ title: 'text', description: 'text', game: 'text' });

module.exports = mongoose.model('Job', jobSchema);

