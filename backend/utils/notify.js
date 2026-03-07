/**
 * notify.js - Shared Socket.IO notification helper
 *
 * Breaks the circular dependency:
 *   controllers → server.js → routes → controllers
 *
 * Usage:
 *   In server.js: require('./utils/notify').init(io);
 *   In controllers: const { notifyUser } = require('../utils/notify');
 */

let _io = null;
// Map of userId (string) → socketId
const userSocketMap = new Map();

/**
 * Called once from server.js after io is created.
 * @param {import('socket.io').Server} io
 */
const init = (io) => {
    _io = io;
};

/**
 * Register a user's socket connection.
 * Called when the 'register' socket event fires.
 * @param {string} userId
 * @param {string} socketId
 */
const registerSocket = (userId, socketId) => {
    userSocketMap.set(String(userId), socketId);
};

/**
 * Remove a socket when it disconnects.
 * @param {string} socketId
 */
const removeSocket = (socketId) => {
    for (const [uid, sid] of userSocketMap.entries()) {
        if (sid === socketId) {
            userSocketMap.delete(uid);
            break;
        }
    }
};

/**
 * Send a real-time notification to a specific user.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {{ type: string, jobId?: string, message: string }} payload
 */
const notifyUser = (userId, payload) => {
    if (!_io) return;
    const socketId = userSocketMap.get(String(userId));
    if (socketId) {
        _io.to(socketId).emit('notification', payload);
    }
};

module.exports = { init, registerSocket, removeSocket, notifyUser };
