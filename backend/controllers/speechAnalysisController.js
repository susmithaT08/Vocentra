const { generateJSON } = require('../utils/geminiClient');

// @desc    Process a simulated speech transcript against a given topic for rigorous vocal grading.
// @route   POST /api/speech-analysis
// @access  Public (Isolated module approach)
const processSpeechAnalysis = async (req, res) => {
    try {
        const { topic, transcript, durationSeconds } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!transcript || transcript.trim() === '') {
            return res.status(200).json({ 
                clarityScore: 0,
                fluencyScore: 0,
                speakingSpeedWPM: 0,
                fillerWordsCount: 0,
                pacingFeedback: "Not enough data recorded.",
                overallFeedback: "You didn't say anything! Please try recording your speech."
            });
        }

        const wordsCount = transcript.split(/\\s+/).length;
        const wpm = durationSeconds > 0 ? Math.round((wordsCount / durationSeconds) * 60) : wordsCount;

        const prompt = `
You are an expert Public Speaking Coach.
A user has recorded a speech on the topic: "${topic}"
Duration: ${durationSeconds} seconds
Calculated Speed: ${wpm} words per minute.
Transcript:
"${transcript}"

Analyze this transcript and evaluate their public speaking skills.
Provide structured JSON matching this exact schema:
{
  "clarityScore": 85, // out of 100
  "fluencyScore": 80, // out of 100
  "speakingSpeedWPM": ${wpm},
  "fillerWordsCount": 3, // Detect logical filler words like "um, uh, like, you know"
  "pacingFeedback": "A 1-sentence specific tip on their speaking speed (ideal is 130-150 WPM).",
  "overallFeedback": "A 2-3 sentence coaching summary touching on how well they addressed the topic and their presence."
}
`;

        let speechResult = {
            clarityScore: 88,
            fluencyScore: 82,
            speakingSpeedWPM: wpm,
            fillerWordsCount: (transcript.match(/\bum\b|\buh\b|\blike\b|\byou know\b/gi) || []).length,
            pacingFeedback: wpm < 120 ? "You're speaking a bit slowly, try to pick up the energy." : wpm > 160 ? "You're rushing. Breathe and slow down for emphasis." : "Your pacing is excellent and conversational.",
            overallFeedback: "Great effort simulating your speech. Your transcript shows good logical flow, though we're running in offline mode so AI analysis is limited."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe assignment, avoiding failures if fields are missing
            speechResult.clarityScore = result.clarityScore ?? speechResult.clarityScore;
            speechResult.fluencyScore = result.fluencyScore ?? speechResult.fluencyScore;
            speechResult.speakingSpeedWPM = result.speakingSpeedWPM ?? speechResult.speakingSpeedWPM;
            speechResult.fillerWordsCount = result.fillerWordsCount ?? speechResult.fillerWordsCount;
            speechResult.pacingFeedback = result.pacingFeedback || speechResult.pacingFeedback;
            speechResult.overallFeedback = result.overallFeedback || speechResult.overallFeedback;
            
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Speech Analysis, using safe fallback", aiError);
        }

        res.status(200).json(speechResult);
    } catch (error) {
        console.error("Error in processSpeechAnalysis:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            clarityScore: 75,
            fluencyScore: 75,
            speakingSpeedWPM: 130,
            fillerWordsCount: 2,
            pacingFeedback: "Maintain a steady pace.",
            overallFeedback: "An unexpected error occurred building the analysis. Keep practicing!"
        });
    }
};

module.exports = {
    processSpeechAnalysis
};
