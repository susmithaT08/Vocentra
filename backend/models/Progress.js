const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        module: {
            type: String,
            required: true,
            enum: ['communication', 'personality', 'career', 'confidence', 'vocabulary'] // Based on standard modules
        },
        progress: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100 // Cap to normal percentages, assuming logic handles scaling
        },
        activityMeta: {
            type: mongoose.Schema.Types.Mixed,
            default: {} // Freeform tracking (e.g. { sessionsCompleted: 5, lastScore: 88, wordsLearned: 50 })
        }
    },
    { timestamps: true }
);

// We should only have one global progress per module per user to easily query aggregate
progressSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
