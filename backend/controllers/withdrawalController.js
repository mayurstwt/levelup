const Withdrawal = require('../models/Withdrawal');
const Ledger = require('../models/Ledger');
const logger = require('../utils/logger');

const MIN_PAYOUT = Number(process.env.MIN_PAYOUT_AMOUNT) || 10;

// @route   POST /api/withdrawals
// @desc    Request a payout from available balance
// @access  Private (Seller only)
exports.requestWithdrawal = async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can request withdrawals' });
        }

        const { amount, payoutMethod, payoutDetails } = req.body;

        if (!amount || amount < MIN_PAYOUT) {
            return res.status(400).json({ message: `Minimum payout is ◈${MIN_PAYOUT}` });
        }
        if (!payoutMethod || !payoutDetails) {
            return res.status(400).json({ message: 'payoutMethod and payoutDetails are required' });
        }

        const ledger = await Ledger.findOne({ userId: req.user.id });
        if (!ledger || ledger.availableBalance < amount) {
            return res.status(400).json({ message: 'Insufficient available balance' });
        }

        // Reserve the amount (move from available to pending)
        ledger.availableBalance -= amount;
        ledger.pendingBalance += amount;
        await ledger.save();

        const withdrawal = await new Withdrawal({
            userId: req.user.id,
            amount,
            payoutMethod,
            payoutDetails,
        }).save();

        logger.info(`Withdrawal request ${withdrawal._id} created for user ${req.user.id}: ◈${amount}`);
        res.status(201).json({ withdrawal, ledger });
    } catch (err) {
        logger.error('requestWithdrawal error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/withdrawals/mine
// @desc    Get the logged-in seller's withdrawal history
// @access  Private (Seller only)
exports.getMyWithdrawals = async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can view withdrawals' });
        }
        const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (err) {
        logger.error('getMyWithdrawals error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/withdrawals (admin only)
// @desc    List all pending withdrawal requests
// @access  Private (Admin only)
exports.listWithdrawals = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }
        const { status = 'pending' } = req.query;
        const withdrawals = await Withdrawal.find({ status })
            .populate('userId', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (err) {
        logger.error('listWithdrawals error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/withdrawals/:id/approve
// @desc    Admin approves or rejects a withdrawal
// @access  Private (Admin only)
exports.processWithdrawal = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }
        const { status, adminNote } = req.body; // status: 'approved'|'rejected'|'paid'
        if (!['approved', 'rejected', 'paid'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved, rejected, or paid' });
        }

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        if (withdrawal.status === 'paid') return res.status(400).json({ message: 'Already processed' });

        const ledger = await Ledger.findOne({ userId: withdrawal.userId });

        if (status === 'rejected' && withdrawal.status === 'pending') {
            // Return funds to available balance
            ledger.availableBalance += withdrawal.amount;
            ledger.pendingBalance -= withdrawal.amount;
            await ledger.save();
        }

        if (status === 'paid' && ledger) {
            // Deduct from pending on final payout
            ledger.pendingBalance -= withdrawal.amount;
            await ledger.save();
        }

        withdrawal.status = status;
        if (adminNote) withdrawal.adminNote = adminNote;
        await withdrawal.save();

        const { notifyUser } = require('../utils/notify');
        notifyUser(withdrawal.userId, {
            type: 'withdrawal',
            message: status === 'paid'
                ? `💸 Your withdrawal of ◈${withdrawal.amount} has been paid!`
                : status === 'approved'
                    ? `✅ Your withdrawal of ◈${withdrawal.amount} was approved and will be processed soon.`
                    : `❌ Your withdrawal of ◈${withdrawal.amount} was rejected. ${adminNote || ''}`
        });

        logger.info(`Withdrawal ${withdrawal._id}: ${status} by admin ${req.user.id}`);
        res.json({ withdrawal, ledger });
    } catch (err) {
        logger.error('processWithdrawal error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
