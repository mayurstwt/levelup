const cron = require('node-cron');
const Job = require('../models/Job');
const { notifyUser } = require('../utils/notify');
const logger = require('../utils/logger');

/**
 * #66 — Dispute Auto-Escalation
 * If a job sits in 'disputed' status for more than 72 hours without admin resolution,
 * send an urgent notification to all admin users.
 */
const autoEscalateDisputes = () => {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        try {
            const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72h ago

            const stalledDisputes = await Job.find({
                status: 'disputed',
                updatedAt: { $lte: cutoff },
            }).populate('buyerId', ['name', 'email'])
                .populate('sellerId', ['name', 'email']);

            if (stalledDisputes.length === 0) return;

            const User = require('../models/User');
            const admins = await User.find({ role: 'admin' }).select('_id');

            for (const job of stalledDisputes) {
                const hoursStalled = Math.floor((Date.now() - new Date(job.updatedAt)) / (1000 * 60 * 60));

                for (const admin of admins) {
                    notifyUser(admin._id, {
                        type: 'urgent',
                        jobId: job._id,
                        message: `🚨 URGENT: Dispute for "${job.title}" has been unresolved for ${hoursStalled}h. Buyer: ${job.buyerId?.name}, Seller: ${job.sellerId?.name}. Please resolve at /admin.`,
                    });
                }

                logger.warn(`[autoEscalateDisputes] Escalated stalled dispute: job ${job._id} (${job.title}) — ${hoursStalled}h unresolved`);
            }

            logger.info(`[autoEscalateDisputes] Escalated ${stalledDisputes.length} stalled disputes.`);
        } catch (err) {
            logger.error('autoEscalateDisputes failed:', err.message);
        }
    });
};

module.exports = autoEscalateDisputes;
