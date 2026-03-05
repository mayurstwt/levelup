const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const { buyerJobLimit } = require('../middleware/checkTier');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/', [
    auth,
    buyerJobLimit,
    body('title', 'Title is required').not().isEmpty().trim().escape(),
    body('description', 'Description is required').not().isEmpty().trim().escape(),
    body('game', 'Game is required').not().isEmpty().trim().escape(),
    body('budget', 'Budget must be numeric').isNumeric(),
    body('timeline', 'Timeline is required').not().isEmpty().trim().escape()
], validate, jobController.createJob);

router.get('/', jobController.getJobs);
router.get('/user', auth, jobController.getUserJobs);
router.get('/:id', jobController.getJobById);

router.put('/:id', [
    auth,
    body('title').optional().trim().escape(),
    body('description').optional().trim().escape(),
    body('budget').optional().isNumeric(),
    body('timeline').optional().trim().escape()
], validate, jobController.updateJob);

router.put('/:id/match', auth, jobController.matchJob);
router.put('/:id/start', auth, jobController.startJob);
router.put('/:id/request-completion', auth, jobController.requestCompletion);
router.put('/:id/complete', auth, jobController.completeJob);
router.put('/:id/dispute', auth, jobController.raiseDispute);
router.delete('/:id', auth, jobController.deleteJob);

module.exports = router;


