const Vocabulary = require('../models/Vocabulary');
const { generateJSON } = require('../utils/geminiClient');

/**
 * @desc    Generate 5 contextual vocabulary words with AI fallback
 * @route   POST /api/vocabulary/words
 * @access  Public
 */
const processVocabularyGeneration = async (req, res) => {
    try {
        const { category } = req.body;
        const requestedCategory = category || "Daily Conversation";

        const prompt = `
You are an expert English Language Teacher.
A user wants to learn 5 advanced but highly practical vocabulary words for the context of: "${requestedCategory}".

For each word, provide: word, phonetics, definition, 3 synonyms, and a realistic example sentence.

Return structured JSON matching this exact schema:
{
  "words": [
    {
      "word": "string",
      "phonetics": "string",
      "definition": "string",
      "synonyms": ["string", "string", "string"],
      "example": "string"
    }
  ]
}
`;

        const fallbackVocab = {
            words: [
                {
                    word: "articulate",
                    phonetics: "/ɑːrˈtɪkjʊlət/",
                    definition: "Having or showing the ability to speak fluently and coherently.",
                    synonyms: ["eloquent", "fluent", "lucid"],
                    example: "An articulate speaker can convey complex ideas easily to any audience."
                },
                {
                    word: "persuasive",
                    phonetics: "/pərˈsweɪsɪv/",
                    definition: "Good at persuading someone through reasoning.",
                    synonyms: ["convincing", "compelling", "effective"],
                    example: "Her persuasive arguments changed the entire team's perspective."
                }
            ]
        };

        let result = fallbackVocab;
        try {
            const aiData = await generateJSON(prompt);
            if (aiData && aiData.words && Array.isArray(aiData.words)) {
                result = aiData;
            }
        } catch (aiError) {
            console.error("Gemini AI failed for Vocabulary, using fallback:", aiError.message);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Vocabulary Generation Error:", error);
        res.status(500).json({ message: "Failed to generate vocabulary." });
    }
};

/**
 * @desc    Get user's vocabulary words due for review
 * @route   GET /api/vocabulary/review
 * @access  Private
 */
const getReviewQueue = async (req, res) => {
    try {
        // Find words where nextReviewDate is now or in the past
        const reviewQueue = await Vocabulary.find({
            user: req.user.id,
            nextReviewDate: { $lte: new Date() }
        }).sort({ nextReviewDate: 1 });

        res.status(200).json(reviewQueue);
    } catch (error) {
        console.error("Error fetching review queue:", error);
        res.status(500).json({ message: "Failed to fetch review queue." });
    }
};

/**
 * @desc    Update progress for a vocabulary word (SRS logic)
 * @route   PUT /api/vocabulary/:id/progress
 * @access  Private
 */
const updateProgress = async (req, res) => {
    try {
        const { isCorrect } = req.body;
        const wordId = req.params.id;

        const vocab = await Vocabulary.findOne({ _id: wordId, user: req.user.id });
        if (!vocab) {
            return res.status(404).json({ message: "Word not found in your library." });
        }

        // SRS Logic (Simplified)
        // Levels: 0 (new), 1 (1 day), 2 (3 days), 3 (7 days), 4 (14 days), 5 (Mastered - 30 days)
        if (isCorrect) {
            vocab.srsLevel = Math.min(vocab.srsLevel + 1, 5);
            vocab.streak += 1;
            vocab.masteryStatus = vocab.srsLevel >= 5 ? 'mastered' : 'reviewing';
        } else {
            vocab.srsLevel = Math.max(vocab.srsLevel - 1, 1); // Reset slightly but not to 0
            vocab.streak = 0;
            vocab.masteryStatus = 'learning';
        }

        // Calculate next review date
        const intervals = [0, 1, 3, 7, 14, 30]; // days
        const daysToAdd = intervals[vocab.srsLevel] || 1;
        
        vocab.nextReviewDate = new Date();
        vocab.nextReviewDate.setDate(vocab.nextReviewDate.getDate() + daysToAdd);
        vocab.lastReviewed = new Date();

        await vocab.save();

        res.status(200).json({ 
            message: "Progress updated successfully", 
            nextReview: vocab.nextReviewDate,
            level: vocab.srsLevel 
        });
    } catch (error) {
        console.error("Error updating vocab progress:", error);
        res.status(500).json({ message: "Failed to update progress." });
    }
};

module.exports = {
    processVocabularyGeneration,
    getReviewQueue,
    updateProgress
};
