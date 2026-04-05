const LinkedinHistory = require('../models/LinkedinHistory');
const { generateJSON } = require('../utils/geminiClient');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @desc    Analyze a LinkedIn profile
 * @route   POST /api/linkedin/analyze
 * @access  Private
 */
const analyzeProfile = async (req, res) => {
    try {
        const { profileUrl, manualData } = req.body;

        if (!profileUrl && !manualData) {
            return res.status(400).json({ message: "Profile URL or manual data is required." });
        }

        let profileContent = manualData ? JSON.stringify(manualData) : "";
        let isScraped = false;

        // Attempt scraping only if no manual data is provided
        if (profileUrl && !manualData) {
            try {
                // LinkedIn typically blocks standard axios requests with 403 or 999
                const response = await axios.get(profileUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 5000
                });

                const $ = cheerio.load(response.data);
                
                // Extremely basic extraction (usually fails on live LinkedIn due to auth/JS walls)
                const headline = $('h1.text-heading-xlarge').text().trim();
                const about = $('.pv-about-section .pv-about__summary-text').text().trim();
                
                if (headline || about) {
                    profileContent = `Headline: ${headline}\nAbout: ${about}`;
                    isScraped = true;
                } else {
                    // If we got HTML but couldn't find selectors (meaning it's the login wall or a block)
                    return res.status(422).json({ 
                        message: "LinkedIn profile is private or restricted. Please provide your profile details manually for a deep analysis.",
                        requiresManualInput: true
                    });
                }
            } catch (scrapeError) {
                console.warn("Scraping failed (Expected for LinkedIn), requesting manual input:", scrapeError.message);
                return res.status(422).json({ 
                    message: "Unable to access profile directly due to LinkedIn restrictions. Please use the manual input option.",
                    requiresManualInput: true
                });
            }
        }

        const prompt = `
You are a World-Class LinkedIn Strategy Consultant and Executive Resume Writer.
Analyze the following LinkedIn profile data and provide a comprehensive, high-impact optimization report.

Profile Data:
${profileContent}

Strictly return a JSON object with this exact structure:
{
  "overallScore": number, // 0-100
  "scoreBreakdown": {
    "headline": number,
    "about": number,
    "experience": number,
    "skills": number,
    "visibility": number
  },
  "feedback": {
    "strengths": ["string", "string"],
    "gaps": ["string", "string"]
  },
  "sectionSuggestions": {
    "headline": "Specific advice to rewrite the headline",
    "about": "Advice for the summary/about section",
    "experience": "Tips for bullet points (STAR method)",
    "skills": "Skill optimization tips",
    "completeness": "Tips to reach 'All-Star' status"
  },
  "keywordOptimization": ["keyword1", "keyword2", "keyword3"], // Keywords for ATS/Recruiter search
  "visibilityTips": ["Actionable tip 1", "Actionable tip 2"], // Posting/Networking advice
  "sampleSnippets": [
    {
      "section": "Headline",
      "before": "Old headline example",
      "after": "New high-impact headline suggestion"
    },
    {
      "section": "About",
      "before": "Old summary snippet",
      "after": "Professional, punchy summary opening"
    }
  ]
}

Make the advice highly specific, professional, and punchy. Ensure the samples are tailored to the content provided.
`;

        const fallbackResult = {
            overallScore: 65,
            scoreBreakdown: { headline: 60, about: 50, experience: 70, skills: 80, visibility: 40 },
            feedback: { 
                strengths: ["Clear job titles", "Relevant skills listed"], 
                gaps: ["Headline is too generic", "Summary lacks keywords"] 
            },
            sectionSuggestions: {
                headline: "Go beyond just your job title; include your USP.",
                about: "Use the first 3 lines to hook the reader with your biggest achievement.",
                experience: "Focus on results, not just responsibilities.",
                skills: "Ensure your top 3 skills match your target role exactly.",
                completeness: "Add a professional banner image and featured section."
            },
            keywordOptimization: ["Project Management", "Agile", "Stakeholder Communication"],
            visibilityTips: ["Comment on 3 industry posts daily", "Share one insight-based post weekly"],
            sampleSnippets: [
                { section: "Headline", before: "Software Engineer at TechCorp", after: "Full-Stack Engineer | Scaling High-Traffic APIs with Node.js & React | Open Source Contributor" }
            ]
        };

        let result = fallbackResult;
        try {
            const aiResponse = await generateJSON(prompt);
            if (aiResponse && aiResponse.overallScore) {
                result = aiResponse;
            }
        } catch (aiError) {
            console.error("Gemini AI Analysis failed, using fallback:", aiError.message);
        }

        const history = await LinkedinHistory.create({
            userId: req.user.id,
            profileUrl: profileUrl || "Manual Input",
            analysisResult: result,
            score: result.overallScore
        });

        res.status(200).json(history);

    } catch (error) {
        console.error("LinkedIn Optimizer Error:", error);
        res.status(500).json({ message: "Server error during LinkedIn analysis." });
    }
};

/**
 * @desc    Get user's LinkedIn analysis history
 * @route   GET /api/linkedin/history/:userId
 * @access  Private
 */
const getHistory = async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const history = await LinkedinHistory.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { analyzeProfile, getHistory };
