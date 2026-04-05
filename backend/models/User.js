const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        // Profile details (Onboarding Phase)
        profilePhoto: { type: String, default: '' },
        role: { type: String, enum: ['student', 'job seeker', 'professional', ''], default: '' },
        education: { type: String, default: '' },
        targetDomain: { type: String, default: '' },
        skills: { type: [String], default: [] },
        experienceLevel: { type: String, default: '' },
        preferredInterviewRole: { type: String, default: '' },
        learningGoals: { type: [String], default: [] },

        // Account Security
        isVerified: { type: Boolean, default: false },
        otpCode: { type: String, default: null },
        otpExpire: { type: Date, default: null },

        // Settings
        notifications: {
            emailAlerts: { type: Boolean, default: true },
            interviewReminders: { type: Boolean, default: true },
            recommendations: { type: Boolean, default: true }
        },
        privacy: {
            profileVisibility: { type: Boolean, default: true },
            dataExport: { type: Boolean, default: true }
        },
        theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
        language: { type: String, default: 'en' },

        // OAuth (Mock)
        googleId: { type: String, default: null },
        linkedinId: { type: String, default: null },

        isOnboardingComplete: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
