const { generateJSON } = require('../utils/geminiClient');

// @desc    Analyze speech or text to determine confidence level
// @route   POST /api/analyze-confidence
// @access  Public (Isolated module approach)
const analyzeConfidence = async (req, res) => {
    try {
        const { text, durationSeconds } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!text || text.trim() === '') {
            return res.status(200).json({ 
                score: 50,
                feedback: "We couldn't detect enough text to analyze. Try speaking or typing a bit more confidently!",
                postureTip: "Remember to keep your chin up and shoulders back before you start speaking."
            });
        }

        const prompt = `
You are an expert Public Speaking and Confidence Coach.
A user has submitted a transcript of their recent practice session. 
Transcript: "${text}"
Duration: ${durationSeconds || 30} seconds.

Analyze their text for confidence, assertiveness, and clarity. Provide structured JSON matching this exact schema:
{
  "score": number // A holistic score from 0-100 indicating public speaking confidence based on the text. Higher means healthier state. Avoid zeroes unless completely incoherent.
  "feedback": "A short 2-3 sentence constructive feedback on their word choice and assertiveness.",
  "postureTip": "A 1-sentence tip about body language or breath control."
}
`;

        let analysisResult = {
            score: 75,
            feedback: "You are expressing yourself well. Try to reduce filler words to sound even more authoritative and confident in your delivery.",
            postureTip: "Take a deep breath and ground your feet firmly to project a stronger voice."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe nullish coalescing to avoid 0 falsy overrides
            analysisResult.score = result.score ?? analysisResult.score;
            analysisResult.feedback = result.feedback ?? analysisResult.feedback;
            analysisResult.postureTip = result.postureTip ?? analysisResult.postureTip;
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Confidence Module, using safe fallback", aiError);
        }

        res.status(200).json(analysisResult);
    } catch (error) {
        console.error("Error in analyzeConfidence:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            score: 70,
            feedback: "Great effort! Consistency is key when building confidence, keep practicing.",
            postureTip: "Roll your shoulders back and maintain eye contact with the mirror."
        });
    }
};

module.exports = {
    analyzeConfidence
};
