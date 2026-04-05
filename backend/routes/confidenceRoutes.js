const express = require('express');
const router = express.Router();
const { analyzeConfidence } = require('../controllers/confidenceAnalysisController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', analyzeConfidence);

module.exports = router;
