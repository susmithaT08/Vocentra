const express = require('express');
const router = express.Router();
const { updateProgress, getProgress, analyzePerformance } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getProgress)
    .post(protect, updateProgress);

router.get('/analyze', protect, analyzePerformance);

module.exports = router;
