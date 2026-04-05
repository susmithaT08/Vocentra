const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        linkedin: { type: String, default: '' },
        targetJobRole: { type: String, required: true },
        careerObjective: { type: String, default: '' },
        education: { type: Array, default: [] },
        skills: { type: Array, default: [] },
        projects: { type: Array, default: [] },
        experience: { type: Array, default: [] },
        certifications: { type: Array, default: [] },
        resumeText: { type: String, default: '' },
        atsScore: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        strict: false // Disable strict mode just in case any schema updates aren't caught by the in-memory DB caching
    }
);

module.exports = mongoose.model('Resume', resumeSchema);
