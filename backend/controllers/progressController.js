const Progress = require('../models/Progress');
const { generateJSON } = require('../utils/geminiClient');

// @desc    Update progress for a specific module
// @route   POST /api/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { module, progress, activityMeta } = req.body;
        
        if (!module || progress === undefined) {
            return res.status(400).json({ message: 'Module and progress value are required.' });
        }

        let progressRecord = await Progress.findOne({ user: req.user._id, module });
        
        if (!progressRecord) {
            progressRecord = new Progress({ user: req.user._id, module, progress, activityMeta: activityMeta || {} });
        } else {
            progressRecord.progress = progress;
            progressRecord.lastUpdated = new Date();
            if (activityMeta) {
                progressRecord.activityMeta = { ...progressRecord.activityMeta, ...activityMeta };
                // Tell mongoose that a Mixed type was modified
                progressRecord.markModified('activityMeta');
            }
        }

        const updatedProgress = await progressRecord.save();

        res.status(200).json(updatedProgress);

    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Server error updating progress' });
    }
};

// @desc    Get all progress components for user
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
    try {
        const progresses = await Progress.find({ user: req.user._id });
        
        // Transform array into an easier object map if frontend expects one
        const progressMap = {};
        progresses.forEach(item => {
            progressMap[item.module] = {
                progress: item.progress,
                activityMeta: item.activityMeta || {},
                lastUpdated: item.updatedAt
            };
        });

        res.status(200).json(progressMap);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
};

// @desc    Analyze performance using AI
// @route   GET /api/progress/analyze
// @access  Private
const analyzePerformance = async (req, res) => {
    try {
        const progresses = await Progress.find({ user: req.user._id });
        
        const communication = progresses.find(p => p.module === 'communication')?.progress || 0;
        const personality = progresses.find(p => p.module === 'personality')?.progress || 0;
        const career = progresses.find(p => p.module === 'career')?.progress || 0;
        const confidence = progresses.find(p => p.module === 'confidence')?.progress || 0;

        let recent_activity = progresses.map(item => {
            return `Module: ${item.module}, Meta: ${JSON.stringify(item.activityMeta || {})}`;
        }).join('\n');

        if (!recent_activity) {
            recent_activity = "No activity logs available yet.";
        }

        const prompt = `User scores:
Communication: ${communication}
Personality: ${personality}
Career Readiness: ${career}
Confidence: ${confidence}

Recent activity:
${recent_activity}

Tasks:
1. Identify strengths (>80)
2. Identify weaknesses (<60)
3. Give 2 short insights
4. Give 2 improvement suggestions

Return JSON:
{
  "strengths": [],
  "weaknesses": [],
  "insights": [],
  "suggestions": []
}`;

        const analysisOutput = await generateJSON(prompt);
        res.status(200).json(analysisOutput);

    } catch (error) {
        console.error('Error analyzing performance:', error);
        res.status(500).json({ message: 'Server error parsing AI performance data' });
    }
};

module.exports = {
    updateProgress,
    getProgress,
    analyzePerformance
};
