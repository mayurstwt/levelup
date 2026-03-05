const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/:jobId', auth, chatController.getChat);

module.exports = router;
