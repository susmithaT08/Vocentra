const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    round: { type: String, enum: ['HR', 'Technical', 'Managerial', 'Stress'], required: true },
    questionText: { type: String, required: true },
    userTranscript: { type: String, default: '' },
    durationSeconds: { type: Number, default: 0 },
    feedback: {
        mistakes: { type: Array, default: [] },
        suggestion: { type: String, default: '' },
        betterSample: { type: String, default: '' },
        score: { type: Number, default: 0 }
    }
});

const interviewSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        mode: { type: String, enum: ['LIVE', 'RECORDED'], default: 'RECORDED' },
        companySimulation: { type: String, default: 'General' },
        status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'IN_PROGRESS' },

        // Array of questions asked across all 4 rounds
        questions: [questionSchema],

        // Final evaluated indices
        overallMetrics: {
            overallScore: { type: Number, default: 0 }, // Out of 100
            communicationIndex: { type: Number, default: 0 },
            technicalStrengthIndex: { type: Number, default: 0 },
            leadershipReadiness: { type: Number, default: 0 },
            confidenceLevel: { type: Number, default: 0 }
        },

        recommendedFocusAreas: { type: Array, default: [] },
        personalizedPlan: { type: String, default: '' },

        date: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
        strict: false
    }
);

module.exports = mongoose.model('Interview', interviewSchema);
