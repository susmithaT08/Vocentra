const express = require('express');
const router = express.Router();
const { processGrammarCheck } = require('../controllers/grammarCheckController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', processGrammarCheck);

module.exports = router;
