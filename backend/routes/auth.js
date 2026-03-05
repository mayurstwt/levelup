const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('role', 'Role must be buyer or seller').isIn(['buyer', 'seller'])
], validate, authController.register);

router.post('/login', [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
], validate, authController.login);

router.get('/profile', auth, authController.getProfile);

router.post('/forgot-password', [
    body('email', 'Please include a valid email').isEmail().normalizeEmail()
], validate, authController.forgotPassword);

router.post('/reset-password/:token', [
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], validate, authController.resetPassword);

router.put('/change-password', [
    auth,
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    body('currentPassword', 'Current password is required').exists()
], validate, authController.changePassword);

// Discord OAuth
router.get('/discord', authController.discordLogin);
router.get('/discord/callback', authController.discordCallback);

module.exports = router;

