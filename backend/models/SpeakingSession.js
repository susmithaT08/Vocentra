const mongoose = require('mongoose');

const speakingSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sessionNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        audioTranscript: {
            type: String,
            required: true
        },
        metrics: {
            overallScore: { type: Number, default: 0 },
            pronunciationScore: { type: Number, default: 0 },
            fluencyScore: { type: Number, default: 0 },
            structureScore: { type: Number, default: 0 },
            confidenceScore: { type: Number, default: 0 },
            intonationScore: { type: Number, default: 0 }
        },
        durationSeconds: {
            type: Number,
            default: 0
        },
        fillerWordCount: {
            type: Number,
            default: 0
        },
        fillerWordDensity: {
            type: Number, // Percentage
            default: 0
        },
        wpm: {
            type: Number,
            default: 0
        },
        strengths: [{ type: String }],
        improvementAreas: [{ type: String }],
        recommendedDrill: { type: String },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('SpeakingSession', speakingSessionSchema);
