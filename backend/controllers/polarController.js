const { Polar } = require('@polar-sh/sdk');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const polar = new Polar({
    accessToken: process.env.POLAR_API_KEY,
});

if (!process.env.POLAR_API_KEY) {
    logger.warn('WARNING: POLAR_API_KEY is not set. Polar integrations will fail.');
}

exports.createCheckout = async (req, res) => {
    try {
        const { jobId, amount } = req.body;

        let amountInCents = 0;
        let metadata = { buyerId: req.user.id };

        const isSubscription = ['seller_pro', 'buyer_pro', 'Seller Pro', 'Buyer Premium'].includes(jobId);

        if (isSubscription) {
            const priceId = (jobId === 'Seller Pro' || jobId === 'seller_pro')
                ? process.env.POLAR_SELLER_PRO_PRICE_ID
                : process.env.POLAR_BUYER_PREMIUM_PRICE_ID;

            if (!priceId) {
                console.error('Missing Polar Price ID for tier:', jobId);
                return res.status(500).json({ message: 'Subscription price ID not configured' });
            }

            // Polar SDK v0.45+ checkouts.create uses products array and prices mapping
            // but for simple cases, passing the paymentlink or creating checkouts 
            // from the backend via standard create payload:
            const checkout = await polar.checkouts.create({
                products: [priceId], // in v0.45, this should be the Product ID, not Price ID
                successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?status=success`,
            });
            return res.json({ url: checkout.url });
        } else {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }
            amountInCents = job.budget * 100;
            metadata.jobId = job._id.toString();

            // Polar SDK 0.45.1 removed `checkouts.custom.create`
            // If we don't have a backing product, we mock it locally or use checkoutLinks
            console.warn("Dynamic arbitrary checkouts without existing Products requires Product creation first in Polar v0.45+");
            return res.status(400).json({ message: 'Dynamic checkouts not fully supported without a Product ID in v0.45+' });
        }
    } catch (err) {
        logger.error('Polar Checkout Error:', err.message);
        res.status(500).json({ message: 'Error creating Polar checkout session' });
    }
};

exports.webhook = async (req, res) => {
    try {
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
        const signature = req.headers['polar-signature'];

        if (!webhookSecret) {
            logger.error('Webhook secret is not configured!');
            return res.status(500).json({ message: 'Webhook Secret Configuration Error' });
        }

        let event;
        // Verify the signature using Polar's webhooks utility
        try {
            event = polar.webhooks.verify({
                payload: req.body,
                headers: {
                    'polar-signature': signature
                },
                secret: webhookSecret
            });
        } catch (verificationError) {
            logger.error('Polar Webhook Signature Verification failed:', verificationError.message);
            return res.status(401).json({ message: 'Webhook Signature Verification Failed' });
        }

        if (event.type === 'checkout.completed') {
            const { metadata, id, amount } = event.data;
            const jobId = metadata?.jobId;

            if (jobId) {
                // Idempotency Check
                const existingTx = await Transaction.findOne({ paymentId: id });
                if (existingTx) {
                    return res.status(200).json({ received: true, message: 'Transaction already processed' });
                }

                let job = await Job.findById(jobId);
                if (job) {
                    const platformFee = (amount / 100) * 0.15; // default 15% platform fee for general checkouts

                    const transaction = new Transaction({
                        jobId: job._id,
                        amount: amount / 100,
                        platformFee: platformFee,
                        status: 'paid',
                        paymentId: id,
                    });
                    await transaction.save();

                    // If job is waiting for escrow to finalize matched status, update it here
                    if (job.status === 'open' || job.status === 'pending_payment') {
                        job.status = 'matched';
                        await job.save();

                        // Notify seller that escrow is funded
                        const { notifyUser } = require('../utils/notify');
                        notifyUser(job.sellerId, { type: 'message', jobId: job._id, message: `✅ Escrow funded for "${job.title}"! You may now start the job.` });
                    }
                }
            }
        } else if (event.type === 'subscription.created' || event.type === 'subscription.updated') {
            const { metadata, price_id, status, id: subEventId } = event.data;

            // Idempotency for subscription events
            const existingSubTx = await Transaction.findOne({ paymentId: `sub_${subEventId}` });
            if (existingSubTx) {
                return res.status(200).json({ received: true, message: 'Subscription event already processed' });
            }

            if (status === 'active' && metadata?.buyerId) {
                const User = require('../models/User');
                let tier = 'none';
                if (price_id === process.env.POLAR_SELLER_PRO_PRICE_ID) tier = 'seller_pro';
                if (price_id === process.env.POLAR_BUYER_PREMIUM_PRICE_ID) tier = 'buyer_pro';

                if (tier !== 'none') {
                    await User.findByIdAndUpdate(metadata.buyerId, { subscription: tier });
                    // Record idempotency marker
                    await new Transaction({
                        paymentId: `sub_${subEventId}`,
                        amount: 0,
                        status: 'subscription_upgraded',
                    }).save();
                    logger.info(`Subscription upgraded for user ${metadata.buyerId} to ${tier}`);
                }
            }
        }

        res.status(200).json({ received: true });
    } catch (err) {
        logger.error('Polar Webhook Error:', err.message);
        res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }
};
