const express = require('express');
const router = express.Router();
const {
    createResume,
    getUserResumes,
    updateResume,
    deleteResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createResume);
router.get('/user/:userId', protect, getUserResumes);
router.put('/update/:resumeId', protect, updateResume);
router.delete('/delete/:resumeId', protect, deleteResume);

module.exports = router;
