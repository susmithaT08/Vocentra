const mongoose = require('mongoose');

const globalWordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    meaning: {
        type: String,
        required: true
    },
    pronunciation: {
        type: String,
        description: 'IPA pronunciation'
    },
    audioUrl: {
        type: String,
        description: 'URL to AWS/External MP3 pronunciation'
    },
    partOfSpeech: {
        type: String,
        enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'],
        required: true
    },
    synonyms: [{
        type: String
    }],
    antonyms: [{
        type: String
    }],
    examples: [{
        type: String
    }],
    context: {
        type: String,
        description: 'Real-life usage context or domain (e.g., Business, Academic, Casual)'
    },
    contexts: [{
        type: String
    }],
    situations: [{
        type: String
    }],
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['Daily Words', 'Academic Words', 'Business Words', 'Interview Vocabulary', 'Conversation Vocabulary', 'General'],
        default: 'General',
        index: true
    }
}, {
    timestamps: true
});

const GlobalWord = mongoose.model('GlobalWord', globalWordSchema);
module.exports = GlobalWord;
