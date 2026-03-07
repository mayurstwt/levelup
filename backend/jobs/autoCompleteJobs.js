const cron = require('node-cron');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const User = require('../models/User');
const { notifyUser } = require('../utils/notify');

const autoCompleteJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running auto-complete jobs check...');
            // Find jobs in review_pending for > 3 days
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            const jobsToComplete = await Job.find({
                status: 'review_pending',
                updatedAt: { $lte: threeDaysAgo }
            });


            for (let job of jobsToComplete) {
                job.status = 'completed';
                await job.save();

                // Process payout to seller
                const tx = await Transaction.findOne({ jobId: job._id, status: 'paid' });
                if (tx && job.sellerId) {
                    const payoutAmount = tx.amount - tx.platformFee;
                    await Ledger.findOneAndUpdate(
                        { userId: job.sellerId },
                        { $inc: { availableBalance: payoutAmount, totalEarned: payoutAmount } },
                        { upsert: true, new: true }
                    );
                }

                if (job.sellerId) {
                    await User.findByIdAndUpdate(job.sellerId, { $inc: { completedJobs: 1 } });
                    notifyUser(job.sellerId, {
                        type: 'completed',
                        jobId: job._id,
                        message: `⏰ Job "${job.title}" has auto-completed after 3 days. Escrow funds released to your wallet!`
                    });
                }
            }
            if (jobsToComplete.length > 0) {
                console.log(`Auto-completed ${jobsToComplete.length} jobs.`);
            }
        } catch (err) {
            console.error('Auto-complete jobs failed:', err.message);
        }
    });
};

module.exports = autoCompleteJobs;
