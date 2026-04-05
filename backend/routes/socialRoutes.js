const express = require('express');
const router = express.Router();
const { processSocialChat } = require('../controllers/socialChatController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', processSocialChat);

module.exports = router;
