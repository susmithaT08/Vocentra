const { generateJSON } = require('../utils/geminiClient');

// @desc    Analyze social chat and return structured feedback and an AI response
// @route   POST /api/social-chat
// @access  Public (Isolated module approach)
const processSocialChat = async (req, res) => {
    try {
        const { scenario, chatHistory, userMessage } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!userMessage || userMessage.trim() === '') {
            return res.status(200).json({ 
                aiReply: "I didn't quite catch that. Could you repeat it?",
                metrics: { clarity: 50, relevance: 50, tone: 50, confidence: 50 },
                suggestion: "Try speaking clearly or typing an introductory sentence."
            });
        }

        const prompt = `
You are an expert Social Skills Coach simulating a real-world scenario.
The user is practicing a scenario: "${scenario}".
Here is the chat history: 
${chatHistory ? JSON.stringify(chatHistory) : "No previous history."}

User just said: "${userMessage}"

Provide a realistic response to their message playing the opposite role, and then rate their response on 4 metrics. Provide structured JSON matching this exact schema:
{
  "aiReply": "Your realistic reply acting as the person they are talking to in the scenario.",
  "metrics": {
      "clarity": number, // 0-100 score
      "relevance": number, // 0-100 score
      "tone": number, // 0-100 score
      "confidence": number // 0-100 score
  },
  "suggestion": "A short 1-2 sentence tip on how they could improve or pivot the conversation gracefully."
}
`;

        let chatResult = {
            aiReply: "That's an interesting point! I haven't thought of it that way. What do you think is the biggest challenge?",
            metrics: {
                clarity: 80,
                relevance: 80,
                tone: 85,
                confidence: 75
            },
            suggestion: "You are doing great. Keep the conversation engaging by asking open-ended questions."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe nullish coalescing to avoid 0 falsy overrides
            chatResult.aiReply = result.aiReply ?? chatResult.aiReply;
            chatResult.suggestion = result.suggestion ?? chatResult.suggestion;
            
            if (result.metrics) {
                chatResult.metrics.clarity = result.metrics.clarity ?? chatResult.metrics.clarity;
                chatResult.metrics.relevance = result.metrics.relevance ?? chatResult.metrics.relevance;
                chatResult.metrics.tone = result.metrics.tone ?? chatResult.metrics.tone;
                chatResult.metrics.confidence = result.metrics.confidence ?? chatResult.metrics.confidence;
            }
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Social Skills Module, using safe fallback", aiError);
        }

        res.status(200).json(chatResult);
    } catch (error) {
        console.error("Error in processSocialChat:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            aiReply: "I see. Let's redirect our conversation. Tell me a bit about your background.",
            metrics: { clarity: 60, relevance: 60, tone: 70, confidence: 60 },
            suggestion: "Maintain active listening cues like nodding or short affirmations."
        });
    }
};

module.exports = {
    processSocialChat
};
