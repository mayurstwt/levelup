const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'refunded'], 
        default: 'pending' 
    },
    paymentId: { type: String } // From Instamojo
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
