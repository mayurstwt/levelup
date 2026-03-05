const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/users', auth, adminController.getUsers);
router.post('/dispute', auth, adminController.resolveDispute);
router.put('/users/:id/ban', auth, adminController.banUser);
router.put('/users/:id/kyc', auth, adminController.approveKYC);

module.exports = router;

