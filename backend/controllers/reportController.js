const Report = require('../models/Report');
const Job = require('../models/Job');
const User = require('../models/User');
const logger = require('../utils/logger');

// @route   POST /api/reports
// @desc    Report a job or a user
// @access  Private
exports.createReport = async (req, res) => {
    try {
        const { jobId, reportedUserId, reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }
        if (!jobId && !reportedUserId) {
            return res.status(400).json({ message: 'Must provide jobId or reportedUserId' });
        }

        // Validate existence
        if (jobId) {
            const jobExists = await Job.findById(jobId);
            if (!jobExists) return res.status(404).json({ message: 'Job not found' });
        }
        if (reportedUserId) {
            const userExists = await User.findById(reportedUserId);
            if (!userExists) return res.status(404).json({ message: 'User not found' });
        }

        const report = await new Report({
            reportedBy: req.user.id,
            jobId,
            reportedUserId,
            reason
        }).save();

        logger.info(`Report ${report._id} created by user ${req.user.id}`);
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (err) {
        logger.error('createReport error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/reports
// @desc    List all reports (filter by status)
// @access  Private (Admin only)
exports.getReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only access' });
        }

        const { status = 'pending' } = req.query;
        const reports = await Report.find({ status })
            .populate('reportedBy', ['name', 'email'])
            .populate('jobId', ['title'])
            .populate('reportedUserId', ['name', 'email'])
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (err) {
        logger.error('getReports error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/reports/:id
// @desc    Update report status and adminNote
// @access  Private (Admin only)
exports.updateReport = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only access' });
        }

        const { status, adminNote } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (status) report.status = status;
        if (adminNote) report.adminNote = adminNote;

        await report.save();

        logger.info(`Report ${report._id} updated by admin ${req.user.id} to status ${status}`);
        res.json(report);
    } catch (err) {
        logger.error('updateReport error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
