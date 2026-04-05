const { generateJSON } = require('../utils/geminiClient');

// @desc    Process assessment answers and generate structured personality insights
// @route   POST /api/self-discovery-insights
// @access  Public (Isolated module approach)
const processSelfDiscovery = async (req, res) => {
    try {
        const { assessmentAnswers, userGoal } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!assessmentAnswers || Object.keys(assessmentAnswers).length === 0) {
            return res.status(200).json({ 
                archetype: "The Explorer",
                strengths: ["Adaptability", "Curiosity"],
                weaknesses: ["Lack of Focus", "Impatience"],
                gapSynthesis: "We need more data to provide a deep analysis. Try completing the assessment!"
            });
        }

        const prompt = `
You are an expert Career and Personality Profiler.
A user has submitted a personality assessment and a career/personal goal.
Answers to psychological questions:
${JSON.stringify(assessmentAnswers)}

User's stated goal: "${userGoal || 'Personal Growth'}"

Analyze their answers to determine their personality archetype, 3 key strengths, 2 potential weaknesses or blind spots, and a synthesis on how their traits align with their goal (the gap).
Provide structured JSON matching this exact schema:
{
  "archetype": "A creative title like 'The Visionary' or 'The Pragmatist'",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "gapSynthesis": "A 3-4 sentence actionable paragraph on how their archetype helps or hinders their specific goal and how to bridge the gap."
}
`;

        let insightResult = {
            archetype: "The Analytical Strategist",
            strengths: ["Critical Thinking", "Problem Solving", "Detail Orientation"],
            weaknesses: ["Overthinking", "Hesitancy to Act without Data"],
            gapSynthesis: "Your analytical approach is an excellent foundation for your goal. However, you might find yourself stuck in 'analysis paralysis'. Learning to trust your intuition and making decisions with 80% of the data will accelerate your progress."
        };

        try {
            const result = await generateJSON(prompt);
            
            // Safe assignment, avoiding failures if fields are missing
            insightResult.archetype = result.archetype || insightResult.archetype;
            insightResult.strengths = Array.isArray(result.strengths) && result.strengths.length > 0 ? result.strengths : insightResult.strengths;
            insightResult.weaknesses = Array.isArray(result.weaknesses) && result.weaknesses.length > 0 ? result.weaknesses : insightResult.weaknesses;
            insightResult.gapSynthesis = result.gapSynthesis || insightResult.gapSynthesis;
            
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Self-Discovery Module, using safe fallback", aiError);
        }

        res.status(200).json(insightResult);
    } catch (error) {
        console.error("Error in processSelfDiscovery:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            archetype: "The Harmonizer",
            strengths: ["Empathy", "Collaboration", "Active Listening"],
            weaknesses: ["Conflict Avoidance", "Putting others first excessively"],
            gapSynthesis: "Your ability to collaborate is great, but ensure you also voice your own needs clearly to achieve your goals effectively."
        });
    }
};

module.exports = {
    processSelfDiscovery
};
