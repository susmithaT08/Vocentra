const Interview = require('../models/Interview');
const { generateText, generateJSON } = require('../utils/geminiClient');

const ROUNDS = ['HR', 'Technical', 'Managerial', 'Stress'];

// Generate dynamic question based on round and company context
const generateQuestion = async (round, companySimulation) => {
    try {
        const prompt = `You are a professional tech interviewer at ${companySimulation}. Generate a single, challenging but fair interview question for a ${round} round. Respond ONLY with the immediate question text. No introductory remarks.`;
        const text = await generateText(prompt);
        return text.trim();
    } catch (e) {
        console.error("AI Error generating question", e);
        return "Can you tell me about your background and experience?";
    }
};

// @desc    Start an Interview Session
// @route   POST /api/interview/start
// @access  Private
const startSession = async (req, res) => {
    try {
        const { mode = 'RECORDED', companySimulation = 'General' } = req.body;

        const interview = await Interview.create({
            userId: req.user.id,
            mode,
            companySimulation,
            status: 'IN_PROGRESS',
            questions: []
        });

        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get next question (dynamic)
// @route   POST /api/interview/:id/question
// @access  Private
const getNextQuestion = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Session not found' });
        if (interview.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        if (interview.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Session no longer active' });

        const currentRoundIndex = interview.questions.length;
        if (currentRoundIndex >= ROUNDS.length) {
            return res.status(400).json({ message: 'All rounds completed. Please finalize session.' });
        }

        const nextRound = ROUNDS[currentRoundIndex];
        const questionText = await generateQuestion(nextRound, interview.companySimulation);

        res.status(200).json({
            round: nextRound,
            roundNumber: currentRoundIndex + 1,
            totalRounds: ROUNDS.length,
            questionText
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit audio/text answer and get deep AI feedback
// @route   POST /api/interview/:id/answer
// @access  Private
const submitAnswer = async (req, res) => {
    try {
        const { questionText, userTranscript, durationSeconds, round } = req.body;
        const interview = await Interview.findById(req.params.id);

        if (!interview) return res.status(404).json({ message: 'Session not found' });
        if (interview.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        // Deep AI Analysis
        const prompt = `
You are an expert Interview Coach.
Evaluate the user's answer to the following interview question.

Ensure your response strictly follows this JSON schema:
{
  "score": number, // 0 to 100 based on quality
  "mistakes": ["string", "string"], // List of 1-3 specific mistakes or areas lacking
  "suggestion": "string", // A 1-2 sentence tip for improvement
  "betterSample": "string" // A concrete example of a stronger answer
}

Round: ${round}
Question: ${questionText}
User's Answer Transcript: ${userTranscript || '(No verbal answer provided or detected)'}
`;

        let mistakes = [], suggestion = "", betterSample = "", score = 50;
        try {
            const aiFeedback = await generateJSON(prompt);
            score = aiFeedback.score || 50;
            mistakes = aiFeedback.mistakes || ["Needs more detail."];
            suggestion = aiFeedback.suggestion || "Ensure you fully answer the prompt.";
            betterSample = aiFeedback.betterSample || "Consider structuring using the STAR method.";
        } catch (e) {
            console.error("AI Error generating feedback", e);
        }

        const newQuestion = {
            round,
            questionText,
            userTranscript,
            durationSeconds,
            feedback: { mistakes, suggestion, betterSample, score }
        };

        interview.questions.push(newQuestion);
        await interview.save();

        res.status(200).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete session and generate final indices
// @route   POST /api/interview/:id/complete
// @access  Private
const completeSession = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) return res.status(404).json({ message: 'Session not found' });
        if (interview.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        // Calculate final indices based on gathered question scores
        const scores = interview.questions.map(q => q.feedback.score);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // Generate personalized plan using AI based on all questions and answers
        const qnaHistory = interview.questions.map((q, i) => `Q${i+1} (${q.round}): ${q.questionText}\nAnswer: ${q.userTranscript}\nScore: ${q.feedback.score}`).join('\n\n');
        
        const summaryPrompt = `
You are an expert Career Coach evaluating a completed mock interview at ${interview.companySimulation}.
Here is the transcript and scores of the session:

${qnaHistory}

Average Score: ${avgScore}/100

Generate a final summary. Strictly follow this JSON schema:
{
  "recommendedFocusAreas": ["string", "string"], // 2-3 key themes to focus on
  "personalizedPlan": "string" // A 3-4 sentence comprehensive feedback paragraph
}
`;
        let recommendedFocusAreas = ["General Practice", "Confidence"];
        let personalizedPlan = "Practice making your answers more structured.";
        try {
            const summaryData = await generateJSON(summaryPrompt);
            recommendedFocusAreas = summaryData.recommendedFocusAreas || recommendedFocusAreas;
            personalizedPlan = summaryData.personalizedPlan || personalizedPlan;
        } catch(e) { 
            console.error("AI Error getting summary", e); 
        }

        interview.status = 'COMPLETED';
        interview.overallMetrics = {
            overallScore: avgScore,
            communicationIndex: Math.min(100, Math.max(0, avgScore + 5)),
            technicalStrengthIndex: Math.min(100, Math.max(0, avgScore - 2)),
            leadershipReadiness: Math.min(100, Math.max(0, avgScore + 2)),
            confidenceLevel: Math.min(100, Math.max(0, avgScore + 8))
        };

        interview.recommendedFocusAreas = recommendedFocusAreas;
        interview.personalizedPlan = personalizedPlan;

        await interview.save();

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user interview history
// @route   GET /api/interview/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const history = await Interview.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single interview details
// @route   GET /api/interview/:id
// @access  Private
const getInterviewDetails = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Session not found' });
        if (interview.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { startSession, getNextQuestion, submitAnswer, completeSession, getHistory, getInterviewDetails };
