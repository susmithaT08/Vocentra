const express = require('express');
const router = express.Router();
const {
    startSession,
    getNextQuestion,
    submitAnswer,
    completeSession,
    getHistory,
    getInterviewDetails
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startSession);
router.post('/:id/question', protect, getNextQuestion);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/complete', protect, completeSession);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterviewDetails);

module.exports = router;
