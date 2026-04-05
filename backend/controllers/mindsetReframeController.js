const { generateJSON } = require('../utils/geminiClient');

// @desc    Process a user's limiting belief into a positive reframed thought with actionable habits.
// @route   POST /api/mindset-reframe
// @access  Public (Isolated module approach)
const processMindsetReframe = async (req, res) => {
    try {
        const { limitingBelief } = req.body;

        // Validation - Never crash, just return fallback feedback if empty
        if (!limitingBelief || limitingBelief.trim() === '') {
            return res.status(200).json({ 
                reframedThought: "My capability is not fixed; I can adapt and grow.",
                dailyAffirmation: "I welcome new challenges as opportunities to expand my skill set.",
                suggestedHabits: ["Write down one win daily.", "Pause when feeling overwhelmed.", "Acknowledge effort over perfection."]
            });
        }

        const prompt = `
You are an expert Cognitive Behavioral Coach. 
A user has submitted the following "Limiting Belief" that is holding back their confidence:
"${limitingBelief}"

1. Reframe this negative belief into a powerful, realistic, and positive growth mindset thought. DO NOT just repeat the input; transform it.
2. Create a very short, punchy Daily Affirmation they can repeat to anchor this new thought.
3. Suggest exactly three (3) highly specific, small, and actionable daily habits they can start doing today to prove their limiting belief wrong.

Provide structured JSON matching this exact schema:
{
  "reframedThought": "The positive, empowered perspective.",
  "dailyAffirmation": "A 1-sentence \"I am\" mantra.",
  "suggestedHabits": ["Habit 1", "Habit 2", "Habit 3"]
}
`;

        const fallbacks = [
            {
                reframedThought: "While this feels difficult right now, my ability to learn is limitless and I am actively improving.",
                dailyAffirmation: "I am patiently building my skills every single day.",
                suggestedHabits: ["Break the task into tiny steps.", "Review past successes daily.", "Practice for 5 minutes."]
            },
            {
                reframedThought: "Every challenge I face is an opportunity to strengthen my resilience and expand my understanding.",
                dailyAffirmation: "I embrace challenges as stepping stones to greatness.",
                suggestedHabits: ["Take deep breaths when stressed.", "Write down one win today.", "Praise effort, not just outcomes."]
            },
            {
                reframedThought: "I may not have the answer yet, but I have the resourcefulness to figure it out.",
                dailyAffirmation: "I am a continuous learner, finding solutions.",
                suggestedHabits: ["Ask for help when stuck.", "Reframe 'can't' to 'can't yet'.", "Celebrate small milestones."]
            },
            {
                reframedThought: "My worth is not defined by perfection, but by my courage to keep showing up.",
                dailyAffirmation: "I am worthy of growth and success.",
                suggestedHabits: ["Jot down a 'Win' each morning.", "Replace 'I must' with 'I can'.", "Smile at one challenge today."]
            },
            {
                reframedThought: "I am in charge of my focus, and I choose to focus on my progress and possibilities.",
                dailyAffirmation: "I choose to see my potential today.",
                suggestedHabits: ["Spend 1 minute imagining success.", "List 3 things you're grateful for.", "Try one new small thing."]
            }
        ];
        
        // Deep clone the random fallback to avoid reference issues
        let mindsetResult = JSON.parse(JSON.stringify(fallbacks[Math.floor(Math.random() * fallbacks.length)]));

        try {
            const result = await generateJSON(prompt);
            
            // Safe assignment, avoiding failures if fields are missing
            mindsetResult.reframedThought = result.reframedThought || mindsetResult.reframedThought;
            mindsetResult.dailyAffirmation = result.dailyAffirmation || mindsetResult.dailyAffirmation;
            
            if (result.suggestedHabits && Array.isArray(result.suggestedHabits) && result.suggestedHabits.length > 0) {
                mindsetResult.suggestedHabits = result.suggestedHabits.slice(0, 3);
            }
            
        } catch (aiError) {
            console.error("Gemini AI JSON generation failed for Mindset Shifts, using safe fallback", aiError);
        }

        res.status(200).json(mindsetResult);
    } catch (error) {
        console.error("Error in processMindsetReframe:", error);
        // Guarantee no crash, return safe response
        res.status(200).json({ 
            reframedThought: "I possess the inner strength to navigate uncertainty and emerge wiser.",
            dailyAffirmation: "I trust my process and my potential.",
            suggestedHabits: ["Take three deep breaths.", "Jot down a small victory.", "Disconnect for offline recovery."]
        });
    }
};

module.exports = {
    processMindsetReframe
};
