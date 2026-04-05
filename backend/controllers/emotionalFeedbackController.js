const { generateText } = require('../utils/geminiClient');

// @desc    Get emotional feedback
// @route   POST /api/emotional-feedback
// @access  Public (or semi-private depending on app needs, assuming isolated here)
const getEmotionalFeedback = async (req, res) => {
    try {
        const { mood, reflection } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!mood || !reflection || reflection.trim() === '') {
            return res.status(200).json({ 
                feedback: "It's okay if you're not ready to reflect fully. Take your time. Identifying your feelings is the first step towards emotional clarity." 
            });
        }

        const prompt = `
You are an expert Emotional Intelligence Coach.
A user has submitted a daily emotional reflection. 
Mood: ${mood}
Reflection: "${reflection}"

Provide a single paragraph of empathetic feedback and actionable advice (maximum 3-4 sentences). Do not use Markdown formatting.
`;

        let feedback = "Thank you for sharing your thoughts today. Taking time to process your emotions is a critical part of self-care and resilience.";
        
        try {
            const result = await generateText(prompt);
            if (result && result.trim()) {
                feedback = result.trim();
            }
        } catch (aiError) {
            console.error("Gemini AI text generation failed, using safe fallback", aiError);
            // feedback retains its fallback value
        }

        res.status(200).json({ feedback });
    } catch (error) {
        console.error("Error in getEmotionalFeedback:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            feedback: "I hear you. Sometimes things get overwhelming. Remember to take deep breaths and process your emotions at your own pace." 
        });
    }
};

module.exports = {
    getEmotionalFeedback
};
