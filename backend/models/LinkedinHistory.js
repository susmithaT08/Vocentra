const mongoose = require('mongoose');

const linkedinHistorySchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        profileUrl: { type: String, required: true },
        analysisResult: { type: Object },
        score: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('LinkedinHistory', linkedinHistorySchema);
