const express = require('express');
const router = express.Router();
const polarController = require('../controllers/polarController');
const auth = require('../middleware/auth');

router.post('/create-checkout', auth, polarController.createCheckout);
router.post('/webhook', express.raw({ type: 'application/json' }), polarController.webhook);

module.exports = router;
