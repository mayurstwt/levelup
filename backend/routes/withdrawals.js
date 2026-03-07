const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    requestWithdrawal,
    getMyWithdrawals,
    listWithdrawals,
    processWithdrawal
} = require('../controllers/withdrawalController');

router.post('/', auth, requestWithdrawal);
router.get('/mine', auth, getMyWithdrawals);
router.get('/', auth, listWithdrawals);              // admin: list all withdrawals
router.put('/:id/process', auth, processWithdrawal); // admin: approve/reject/pay

module.exports = router;
