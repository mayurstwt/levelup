const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/sellers', userController.getSellers);
router.get('/:id/profile', userController.getPublicProfile);
router.put('/me', auth, userController.updateProfile);
router.put('/kyc', auth, userController.submitKYC);

module.exports = router;

