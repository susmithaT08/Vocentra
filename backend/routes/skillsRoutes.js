const express = require('express');
const router = express.Router();
const {
    generateAnalysis,
    getHistory,
    overrideScore
} = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');

router.get('/analyze', protect, generateAnalysis);
router.get('/history', protect, getHistory);
router.post('/override', protect, overrideScore);

module.exports = router;
