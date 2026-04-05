const mongoose = require('mongoose');

const vocabularySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        word: {
            type: String,
            required: true,
            trim: true,
        },
        meaning: {
            type: String,
            required: true,
        },
        pronunciation: {
            type: String, // e.g., IPA notation "/ɪɡˈzæmpəl/"
            default: '',
        },
        audioUrl: {
            type: String, // URL to pronunciation audio
            default: '',
        },
        partOfSpeech: {
            type: String,
            default: 'unknown',
        },
        synonyms: {
            type: [String],
            default: [],
        },
        antonyms: {
            type: [String],
            default: [],
        },
        examples: {
            type: [String],
            default: [],
        },
        context: {
            type: String, // real-life usage contexts
            default: '',
        },
        contexts: {
            type: [String],
            default: [],
        },
        situations: {
            type: [String],
            default: [],
        },
        collectionName: {
            type: String,
            default: 'General',
        },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        personalNotes: {
            type: String,
            default: '',
        },

        // Spaced Repetition System (SRS) fields
        srsLevel: {
            type: Number,
            default: 0, // 0 = learning, 1-4 = reviewing, 5 = mastered
        },
        nextReviewDate: {
            type: Date,
            default: Date.now,
        },
        lastReviewed: {
            type: Date,
            default: null,
        },
        streak: {
            type: Number,
            default: 0,
        },
        masteryStatus: {
            type: String,
            enum: ['learning', 'reviewing', 'mastered'],
            default: 'learning',
        },
    },
    {
        timestamps: true,
    }
);

// Index to quickly find words due for review for a specific user
vocabularySchema.index({ user: 1, nextReviewDate: 1 });

// Ensure a user doesn't add the exact same word multiple times
vocabularySchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
