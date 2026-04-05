const SpeakingSession = require('../models/SpeakingSession');
const { getAIAudioFeedback } = require('../utils/speechEvaluator');


// @desc    Evaluate Speech Session
// @route   POST /api/speaking/evaluate
// @access  Private
const evaluateSpeech = async (req, res) => {
    try {
        const { sessionNumber, durationSeconds } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Audio file is required' });
        }

        const aiResult = await getAIAudioFeedback(req.file.buffer, req.file.mimetype);
        
        const transcript = aiResult.transcript || "";
        const m = aiResult.metrics || { fillerCount: 0, fillerDensity: 0, wpm: 0 };
        const scores = aiResult.scores || {};
        const feedback = aiResult.feedback || {};

        const newSession = await SpeakingSession.create({
            userId: req.user.id,
            sessionNumber: parseInt(sessionNumber, 10) || 1,
            audioTranscript: transcript,
            durationSeconds: parseFloat(durationSeconds) || 60,
            fillerWordCount: m.fillerCount,
            fillerWordDensity: m.fillerDensity,
            wpm: m.wpm,
            metrics: {
                overallScore: scores.overall || 50,
                pronunciationScore: scores.pronunciation || 50,
                fluencyScore: scores.fluency || 50,
                structureScore: scores.structure || 50,
                confidenceScore: scores.confidence || 50,
                intonationScore: scores.intonation || 50
            },
            strengths: feedback.strengths || [],
            improvementAreas: feedback.improvementAreas || [],
            recommendedDrill: feedback.recommendedDrill || ""
        });

        res.status(201).json({
            message: "Speech evaluation complete",
            data: newSession
        });

    } catch (error) {
        console.error("Speech Evaluation Error:", error);
        res.status(500).json({ message: "Server error during evaluation", error: error.message });
    }
};

// @desc    Get Speaking History
// @route   GET /api/speaking/progress
// @access  Private
const getSpeakingProgress = async (req, res) => {
    try {
        const history = await SpeakingSession.find({ userId: req.user.id }).sort({ date: 1 }); // Chronological for graphs
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    evaluateSpeech,
    getSpeakingProgress
};
