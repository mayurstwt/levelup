const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, reviewController.submitReview);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
