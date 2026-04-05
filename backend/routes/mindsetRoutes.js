const express = require('express');
const router = express.Router();
const { processMindsetReframe } = require('../controllers/mindsetReframeController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', processMindsetReframe);

module.exports = router;
