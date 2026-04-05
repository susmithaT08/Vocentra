const express = require('express');
const router = express.Router();
const { getEmotionalFeedback } = require('../controllers/emotionalFeedbackController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', getEmotionalFeedback);

module.exports = router;
