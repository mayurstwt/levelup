const cron = require('node-cron');
const Job = require('../models/Job');

// Run every day at midnight: expire open jobs older than 7 days
cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const result = await Job.updateMany(
            { status: 'open', expiresAt: { $lte: now } },
            { $set: { status: 'expired' } }
        );
        if (result.modifiedCount > 0) {
            console.log(`[Cron] Expired ${result.modifiedCount} jobs at ${now.toISOString()}`);
        }
    } catch (err) {
        console.error('[Cron] Job expiry error:', err.message);
    }
});

console.log('[Cron] Job expiry scheduler registered (runs daily at midnight)');
