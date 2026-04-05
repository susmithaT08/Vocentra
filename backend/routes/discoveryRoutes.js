const express = require('express');
const router = express.Router();
const { processSelfDiscovery } = require('../controllers/selfDiscoveryController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', processSelfDiscovery);

module.exports = router;
