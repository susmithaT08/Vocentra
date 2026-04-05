const { generateAudioJSON } = require('./geminiClient');

const getAIAudioFeedback = async (audioBuffer, mimeType) => {
    const prompt = `
You are an expert Speech Coach. Listen to the provided audio file of a user's spoken response.
Your task is to transcribe exactly what was said and then evaluate it.

Calculations for your reference (do these internally):
- WPM (Words Per Minute): estimate based on transcript length and audio duration.
- Filler Words: Count occurrences of "um", "uh", "like", "you know", etc.
- Filler Density %: (Filler words / Total words) * 100.

Ensure your response strictly follows this JSON schema:
{
  "transcript": "string", // The exact transcribed text of the audio
  "metrics": {
    "fillerCount": number,
    "fillerDensity": number, // percentage
    "wpm": number
  },
  "scores": {
    "fluency": number, // 0-100
    "structure": number, // 0-100
    "pronunciation": number, // 0-100
    "intonation": number, // 0-100
    "confidence": number // 0-100
  },
  "feedback": {
    "strengths": ["string", "string"], // 1-2 strengths
    "improvementAreas": ["string", "string"], // 1-2 areas to improve
    "recommendedDrill": "string" // A specific practice exercise suggestion
  }
}
`;
    
    try {
        const aiResponse = await generateAudioJSON(audioBuffer, mimeType, prompt);
        
        // Calculate overall score
        const s = aiResponse.scores || {};
        const fluency = s.fluency || 50;
        const structure = s.structure || 50;
        const pronunciation = s.pronunciation || 50;
        const intonation = s.intonation || 50;
        const confidence = s.confidence || 50;
        
        s.overall = Math.round((fluency + structure + pronunciation + intonation + confidence) / 5);
        
        // Ensure feedback exists
        aiResponse.feedback = aiResponse.feedback || {
            strengths: ["Good effort."],
            improvementAreas: ["Keep practicing."],
            recommendedDrill: "General Practice"
        };
        
        return aiResponse;
    } catch (error) {
        console.error("Gemini AI Audio Evaluation Error:", error);
        throw new Error("Unable to analyze audio.");
    }
};

module.exports = {
    getAIAudioFeedback
};
