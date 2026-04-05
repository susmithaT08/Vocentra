const mongoose = require('mongoose');

const eiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: String,
        required: true,
        enum: ['Great', 'Good', 'Okay', 'Stressed', 'Exhausted', 'Anxious']
    },
    reflection: {
        type: String,
        required: true
    },
    aiFeedback: {
        strengths: [String],
        empathyMessage: String,
        actionableAdvice: [String],
        emotionalHealthScore: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmotionalIntelligence', eiSchema);
