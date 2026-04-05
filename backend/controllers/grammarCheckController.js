const { generateJSON } = require('../utils/geminiClient');

// @desc    Process text to detect grammatical errors, suggest rewrites, and analyze tone.
// @route   POST /api/grammar-check
// @access  Public (Isolated module approach)
const processGrammarCheck = async (req, res) => {
    try {
        const { text, correctionMode } = req.body; // Modes: 'basic', 'intermediate', 'advanced'

        // Validation - Never crash, just return fallback feedback if empty
        if (!text || text.trim() === '') {
            return res.status(200).json({ 
                corrections: [],
                rewrittenSentence: "",
                tone: "Neutral",
                overallFeedback: "Start typing to receive real-time grammar feedback."
            });
        }

        const modeInstruction = correctionMode === 'advanced' 
            ? 'Provide advanced stylistic rewrites and vocabulary enhancements.' 
            : correctionMode === 'intermediate'
            ? 'Correct all grammar and improve sentence flow.'
            : 'Focus strictly on obvious spelling and basic grammar mistakes.';

        const prompt = `
You are an expert Copy Editor and Linguistics Coach.
A user has written a draft:
"${text}"

Correction Mode applied: ${modeInstruction}

Analyze their text and provide structured JSON matching this exact schema:
{
  "corrections": [
     { "original": "the exact misspelled or grammatically incorrect word/phrase found in the text", "replacement": "the corrected fix", "explanation": "Short 1 sentence reason why it was wrong." }
  ],
  "rewrittenSentence": "A fully polished version of their entire text applying all corrections and stylistic improvements.",
  "tone": "A single word or phrase describing the tone (e.g. 'Professional', 'Casual', 'Assertive', 'Anxious')",
  "overallFeedback": "A 1-2 sentence encouraging feedback on their writing clarity."
}
If no corrections are needed, return an empty array for 'corrections'.
`;

        let grammarResult = {
            corrections: [
                { original: "example", replacement: "corrected example", explanation: "Simulated correction because AI failed to parse." }
            ],
            rewrittenSentence: text,
            tone: "Neutral",
            overallFeedback: "Your text is structured well, but the AI engine is currently running in offline mock-mode."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe assignment, avoiding failures if fields are missing
            grammarResult.corrections = Array.isArray(result.corrections) ? result.corrections : [];
            grammarResult.rewrittenSentence = result.rewrittenSentence || text;
            grammarResult.tone = result.tone || "Neutral";
            grammarResult.overallFeedback = result.overallFeedback || "Well written!";
            
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Grammar Module, using safe fallback", aiError);
            if (text.length > 5) {
                // Mock a simple correction if we are in fallback mode
                grammarResult.corrections = [];
                grammarResult.overallFeedback = "Your text is clear. (Running in offline fallback mode).";
            }
        }

        res.status(200).json(grammarResult);
    } catch (error) {
        console.error("Error in processGrammarCheck:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            corrections: [],
            rewrittenSentence: req.body.text || "",
            tone: "Unknown",
            overallFeedback: "An unexpected error occurred. Please try again."
        });
    }
};

module.exports = {
    processGrammarCheck
};
