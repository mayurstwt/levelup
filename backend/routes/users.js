const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/sellers', userController.getSellers);
router.get('/:id/profile', userController.getPublicProfile);
router.put('/me', auth, userController.updateProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/kyc', auth, userController.submitKYC);
router.post('/portfolio', auth, userController.addPortfolioItem);
router.delete('/portfolio/:itemId', auth, userController.removePortfolioItem);

module.exports = router;

