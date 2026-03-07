const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const auth = require('../middleware/auth');
const { sellerBidLimit } = require('../middleware/checkTier');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/', [
    auth,
    sellerBidLimit,
    body('jobId', 'Valid job ID required').isMongoId(),
    body('bidAmount', 'Bid amount must be numeric and positive').isFloat({ gt: 0 }),
    body('message', 'Message is required').not().isEmpty().trim().escape()
], validate, bidController.submitBid);

router.get('/mine', auth, bidController.getMyBids);
router.get('/job/:jobId', auth, bidController.getJobBids);
router.put('/:id/accept', auth, bidController.acceptBid);
router.delete('/:id', auth, bidController.withdrawBid);
router.post('/:id/counter', auth, bidController.counterOffer);
router.post('/:id/counter/accept', auth, bidController.acceptCounterOffer);

module.exports = router;