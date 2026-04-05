const express = require('express');
const router = express.Router();
const { processConversationChat } = require('../controllers/conversationChatController');

// Using a public or open route for maximum isolation without complex middleware dependencies.
router.post('/', processConversationChat);

module.exports = router;
