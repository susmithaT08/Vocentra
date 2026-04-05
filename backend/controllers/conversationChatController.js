const { generateJSON } = require('../utils/geminiClient');

// @desc    Process multi-turn conversation parsing the chosen scenario and AI personality
// @route   POST /api/conversation-chat
// @access  Public (Isolated module approach)
const processConversationChat = async (req, res) => {
    try {
        const { messageHistory, scenario, difficulty, aiPersonality } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!messageHistory || messageHistory.length === 0) {
            return res.status(200).json({ 
                aiReply: "Hello! Let's get started. Are you ready?",
                metrics: { grammar: 100, fluency: 100, relevance: 100, confidence: 100 },
                coachingSuggestion: "Type a message to begin the simulation."
            });
        }

        const userLatestMessage = messageHistory[messageHistory.length - 1].content;
        const pastContext = messageHistory.slice(0, -1).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\\n');

        const prompt = `
You are an AI acting as a conversational partner in a "${scenario}" scenario.
Your persona is: ${aiPersonality} (Maintain this tone rigorously, using vocabulary and mannerisms appropriate for this persona).
The difficulty level is: ${difficulty}. 
- If difficulty is Hard, challenge the user, ask tough follow-up questions, and require sophisticated answers.
- If Medium, be a standard balanced conversation partner.
- If Easy, be encouraging, use simpler language, and provide hints if they struggle.

Conversation History:
${pastContext}

User's Latest Message:
"${userLatestMessage}"

TASK:
1. Generate your next response in character. Keep it natural and conversational (1-3 sentences). Do not just agree; drive the conversation forward.
2. Evaluate the user's latest message on four metrics (0-100 scale):
   - grammar: Correctness and syntax.
   - fluency: Natural flow and phrasing.
   - relevance: How well they addressed the context.
   - confidence: Use of fillers vs assertive language.
3. Provide one targeted 1-sentence coaching tip to improve their very next reply.

Return structured JSON exactly like this:
{
  "aiReply": "Your in-character response",
  "metrics": {
    "grammar": 90,
    "fluency": 85,
    "relevance": 95,
    "confidence": 80
  },
  "coachingSuggestion": "A brief, 1 sentence tip on how they could improve their communication here."
}
`;

        let conversationResult = {
            aiReply: "That's an interesting point. Could you elaborate a bit more on that?",
            metrics: { grammar: 90, fluency: 90, relevance: 90, confidence: 90 },
            coachingSuggestion: "Try adding more specific details to your response to sound more authoritative."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe assignment, avoiding failures if fields are missing
            conversationResult.aiReply = result.aiReply || conversationResult.aiReply;
            conversationResult.coachingSuggestion = result.coachingSuggestion || conversationResult.coachingSuggestion;
            
            if (result.metrics) {
                conversationResult.metrics.grammar = result.metrics.grammar ?? conversationResult.metrics.grammar;
                conversationResult.metrics.fluency = result.metrics.fluency ?? conversationResult.metrics.fluency;
                conversationResult.metrics.relevance = result.metrics.relevance ?? conversationResult.metrics.relevance;
                conversationResult.metrics.confidence = result.metrics.confidence ?? conversationResult.metrics.confidence;
            }
            
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Conversation Practice, using safe fallback", aiError);
            conversationResult.aiReply = "I understand. Let's continue. (Offline Mock Mode)";
        }

        res.status(200).json(conversationResult);
    } catch (error) {
        console.error("Error in processConversationChat:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            aiReply: "I'm having trouble connecting right now, but please continue your train of thought.",
            metrics: { grammar: 80, fluency: 80, relevance: 80, confidence: 80 },
            coachingSuggestion: "Keep practicing! An unexpected error occurred on the AI server."
        });
    }
};

module.exports = {
    processConversationChat
};
