const EmotionalIntelligence = require('../models/EmotionalIntelligence');
const { generateJSON } = require('../utils/geminiClient');

// @desc    Submit a daily reflection and get AI emotional feedback
// @route   POST /api/ei/reflect
// @access  Private
const submitReflection = async (req, res) => {
    try {
        const { mood, reflection } = req.body;

        if (!mood || !reflection) {
            return res.status(400).json({ message: 'Mood and reflection are required' });
        }

        const prompt = `
You are an expert Emotional Intelligence Coach and empathetic listener.
A user has submitted their daily emotional reflection. 
User's self-reported mood: ${mood}
User's reflection text: "${reflection}"

Provide a structured, supportive response utilizing cognitive behavioral principles where appropriate.

Strictly format your response as JSON matching this schema:
{
  "empathyMessage": "A short 1-2 sentence empathetic validation of and response to their feelings.",
  "strengths": ["Identify 1-2 emotional strengths they demonstrated in their reflection", "String 2"],
  "actionableAdvice": ["Provide 1-2 specific, actionable steps to improve or maintain their emotional state", "String 2"],
  "emotionalHealthScore": number // A holistic score from 0-100 indicating emotional balance/regulation based on the text. Higher means healthier state.
}
`;

        let aiFeedback = {
            empathyMessage: "Thank you for sharing your thoughts today. It takes courage to reflect on your emotions.",
            strengths: ["Self-awareness", "Honesty"],
            actionableAdvice: ["Take some time to rest and recharge.", "Consider discussing these feelings with a friend."],
            emotionalHealthScore: 60
        };

        try {
            const result = await generateJSON(prompt);
            aiFeedback.empathyMessage = result.empathyMessage ?? aiFeedback.empathyMessage;
            aiFeedback.strengths = result.strengths ?? aiFeedback.strengths;
            aiFeedback.actionableAdvice = result.actionableAdvice ?? aiFeedback.actionableAdvice;
            aiFeedback.emotionalHealthScore = result.emotionalHealthScore ?? 60;
        } catch (aiError) {
            console.error("Gemini AI failed for EI Module, using safe fallback", aiError);
        }

        const newLog = await EmotionalIntelligence.create({
            user: req.user.id, // Assuming req.user is set by auth middleware
            mood,
            reflection,
            aiFeedback
        });

        res.status(201).json(newLog);
    } catch (error) {
        console.error("EI Reflection Error:", error);
        res.status(500).json({ message: 'Server error processing reflection' });
    }
};

// @desc    Get user's EI reflection history
// @route   GET /api/ei/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const history = await EmotionalIntelligence.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching EI history' });
    }
};

module.exports = {
    submitReflection,
    getHistory
};
