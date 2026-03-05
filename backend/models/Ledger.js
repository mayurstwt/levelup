const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
