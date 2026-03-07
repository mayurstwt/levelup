const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    game: { type: String, required: true },
    serviceType: { type: String, default: '' },
    budget: { type: Number, required: true },
    timeline: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }], // free-form tags e.g. ['coaching','ranked']
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

// Compound indexes for common query patterns (#77)
jobSchema.index({ status: 1, game: 1 });         // getJobs: filter by open + game
jobSchema.index({ buyerId: 1, status: 1 });       // getUserJobs: buyer dashboard
jobSchema.index({ sellerId: 1, status: 1 });      // seller dashboard
jobSchema.index({ status: 1, updatedAt: 1 });     // cron jobs: find stale matched/disputed
jobSchema.index({ tags: 1 });                     // #57 tag-based filtering

module.exports = mongoose.model('Job', jobSchema);

