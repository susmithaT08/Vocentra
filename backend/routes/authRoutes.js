const express = require('express');
const router = express.Router();
const { registerUser, verifyOTP, loginUser } = require('../controllers/authController');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', verifyOTP);

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

module.exports = router;
