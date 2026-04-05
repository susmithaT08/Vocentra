const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Register user and generate OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        const user = await User.create({ name, email, password, otpCode, otpExpire });

        if (user) {
            // Send OTP via email
            try {
                await sendEmail(
                    email,
                    'Vocentra - Verify Your Email',
                    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:30px;background:#1a1025;border-radius:16px;border:1px solid #2d2040;">
                        <h2 style="color:#a78bfa;text-align:center;margin-bottom:8px;">Vocentra</h2>
                        <p style="color:#9ca3af;text-align:center;font-size:14px;margin-bottom:24px;">AI Career Intelligence</p>
                        <p style="color:#e5e7eb;font-size:15px;">Hi ${name},</p>
                        <p style="color:#9ca3af;font-size:14px;">Your verification code is:</p>
                        <div style="text-align:center;margin:24px 0;">
                            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#a78bfa;background:#2d2040;padding:12px 24px;border-radius:12px;">${otpCode}</span>
                        </div>
                        <p style="color:#6b7280;font-size:12px;text-align:center;">This code expires in 10 minutes.</p>
                    </div>`
                );
                console.log(`[EMAIL SENT] OTP sent to ${email}`);
            } catch (emailError) {
                console.warn(`[EMAIL FAILED] Could not send to ${email}. OTP: ${otpCode}`);
            }

            res.status(201).json({
                message: 'User registered. Please check your email for the verification code.',
                userId: user._id
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.otpCode !== otp.toString() || Date.now() > user.otpExpire) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isOnboardingComplete: user.isOnboardingComplete,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Bypass verification requirement for test user
            if (!user.isVerified && user.email !== 'jane@example.com') {
                return res.json({
                    userId: user._id,
                    message: "Please verify your email to log in.",
                    requireVerification: true
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isOnboardingComplete: user.isOnboardingComplete,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    verifyOTP,
    loginUser
};
