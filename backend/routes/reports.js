const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createReport,
    getReports,
    updateReport
} = require('../controllers/reportController');

router.post('/', auth, createReport);
router.get('/', auth, getReports);         // admin
router.put('/:id', auth, updateReport);    // admin

module.exports = router;
