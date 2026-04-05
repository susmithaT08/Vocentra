const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // assuming standard Vocentra auth middleware structure
const { submitReflection, getHistory } = require('../controllers/eiController');

router.post('/reflect', protect, submitReflection);
router.get('/history', protect, getHistory);

module.exports = router;
