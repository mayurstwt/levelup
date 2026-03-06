const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Context of the chat
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, default: '' },
        mediaUrl: { type: String, default: null },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
