const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create', auth, paymentController.createPayment);
router.post('/webhook', paymentController.webhook); // Webhook usually unauthenticated but payload verified
router.get('/history', auth, paymentController.getHistory);

module.exports = router;
