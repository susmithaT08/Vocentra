const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processVocabularyGeneration, getReviewQueue, updateProgress } = require('../controllers/vocabularyController');

// Mounted at /api/vocabulary in server.js
// POST /api/vocabulary/words
router.post('/words', processVocabularyGeneration);

// SRS Logic - Review items and track progress
router.get('/review', protect, getReviewQueue);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
