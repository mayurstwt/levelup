const cron = require('node-cron');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { notifyUser } = require('../utils/notify');
const logger = require('../utils/logger');

/**
 * #65 — Auto-cancel abandoned matched jobs
 * If a seller never calls "startJob" within 24 hours of a job being matched,
 * reset the job back to "open" and reject the accepted bid.
 */
const autoCancelAbandonedJobs = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

            const abandonedJobs = await Job.find({
                status: 'matched',
                updatedAt: { $lte: cutoff },
            });

            if (abandonedJobs.length === 0) return;

            for (const job of abandonedJobs) {
                const prevSellerId = job.sellerId;

                // Reset the job back to open
                job.status = 'open';
                job.sellerId = null;
                await job.save();

                // Reject the accepted bid so seller cannot re-claim
                await Bid.findOneAndUpdate(
                    { jobId: job._id, status: 'accepted' },
                    { status: 'rejected' }
                );

                // Notify buyer the match expired
                notifyUser(job.buyerId, {
                    type: 'system',
                    jobId: job._id,
                    message: `⚠️ The seller didn't start "${job.title}" within 24 hours. Job is open for new bids.`,
                });

                // Notify seller their match was cancelled
                if (prevSellerId) {
                    notifyUser(prevSellerId, {
                        type: 'system',
                        jobId: job._id,
                        message: `❌ Your match for "${job.title}" was cancelled — you didn't start within 24 hours.`,
                    });
                }

                logger.info(`Auto-cancelled abandoned matched job: ${job._id} (${job.title})`);
            }

            logger.info(`[autoCancelAbandonedJobs] Processed ${abandonedJobs.length} abandoned jobs.`);
        } catch (err) {
            logger.error('autoCancelAbandonedJobs failed:', err.message);
        }
    });
};

module.exports = autoCancelAbandonedJobs;
