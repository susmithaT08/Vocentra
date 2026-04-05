const express = require('express');
const router = express.Router();
const {
    analyzeProfile,
    getHistory
} = require('../controllers/linkedinController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeProfile);
router.get('/history/:userId', protect, getHistory);

module.exports = router;
