const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile & onboarding
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update basic details
            user.name = req.body.name || user.name;
            user.profilePhoto = req.body.profilePhoto !== undefined ? req.body.profilePhoto : user.profilePhoto;

            // Onboarding data
            if (req.body.role !== undefined) user.role = req.body.role;
            if (req.body.education !== undefined) user.education = req.body.education;
            if (req.body.targetDomain !== undefined) user.targetDomain = req.body.targetDomain;
            if (req.body.skills !== undefined) user.skills = req.body.skills;
            if (req.body.experienceLevel !== undefined) user.experienceLevel = req.body.experienceLevel;
            if (req.body.preferredInterviewRole !== undefined) user.preferredInterviewRole = req.body.preferredInterviewRole;
            if (req.body.learningGoals !== undefined) user.learningGoals = req.body.learningGoals;

            if (req.body.isOnboardingComplete !== undefined) user.isOnboardingComplete = req.body.isOnboardingComplete;

            // Settings
            if (req.body.notifications) {
                user.notifications = { ...user.notifications, ...req.body.notifications };
            }
            if (req.body.privacy) {
                user.privacy = { ...user.privacy, ...req.body.privacy };
            }
            if (req.body.theme !== undefined) user.theme = req.body.theme;
            if (req.body.language !== undefined) user.language = req.body.language;

            const updatedUser = await user.save();

            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};
