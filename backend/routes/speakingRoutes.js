const express = require('express');
const router = express.Router();
const multer = require('multer');
const { evaluateSpeech, getSpeakingProgress } = require('../controllers/speakingController');
const { processSpeechAnalysis } = require('../controllers/speechAnalysisController');
const { protect } = require('../middleware/auth');

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/evaluate', protect, upload.single('audio'), evaluateSpeech);
router.get('/progress', protect, getSpeakingProgress);

// Legacy/other routes
router.post('/', processSpeechAnalysis);

module.exports = router;
