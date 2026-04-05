const { generateJSON } = require('../utils/geminiClient');

// @desc    Generate tailored project ideas using AI
// @route   POST /api/project-generator/generate
// @access  Public (Isolated module)
const generateProjects = async (req, res) => {
    try {
        const { branch, level, domain, languages } = req.body;

        if (!branch || !level || !domain || !languages || !Array.isArray(languages)) {
            return res.status(400).json({ message: "branch, level, domain, and an array of languages are required." });
        }

        const prompt = `
You are an expert Technical Career Coach and Principal Engineer.
A student is looking for highly relevant, non-repetitive, and extremely impressive capstone/portfolio projects to boost their employability. 
Their profile:
- Engineering Branch: ${branch}
- Target Difficulty Level: ${level}
- Project Domain: ${domain}
- Preferred Tech Stack/Languages: ${languages.join(', ')}

Please generate exactly 3 unique Project Ideas that perfectly align with these parameters. Do NOT provide generic ideas like "To-Do List" or "Basic E-commerce". Think like a senior engineer assigning a meaningful, industry-level problem.
Vary the problem statements wildly to ensure totally unique answers every time.

Strictly return JSON matching this exact schema for an array of 3 projects:
{
  "projects": [
    {
      "id": "A unique slug, e.g. cyber-threat-map-01",
      "title": "A highly creative project title",
      "problemStatement": "A 1-2 sentence compelling real-world problem statement.",
      "keyFeatures": ["String", "String", "String"],
      "techStack": ["Matched strictly to their preferred languages and realistic complementary tools"],
      "difficulty": {
        "level": "${level}",
        "justification": "Why this aligns with their skill level."
      },
      "resumeWeightage": {
        "score": number, // out of 10
        "reasoning": "Why this looks impressive on a resume."
      },
      "placementWeightage": {
        "level": "Low" | "Medium" | "High",
        "explanation": "Current hiring trends for this domain."
      }
    }
  ]
}
`;

        const fallbackProjects = {
            projects: [
                {
                    id: "fallback-proj-1",
                    title: "Automated Log Analyzer System",
                    problemStatement: "Current log processing is manual and prone to human error, missing critical security events.",
                    keyFeatures: ["Anomaly detection pipeline", "Real-time alerting", "Interactive Dashboard"],
                    techStack: languages.length > 0 ? languages : ["Python", "JavaScript"],
                    difficulty: { level: level, justification: "Matches the requested level constraints." },
                    resumeWeightage: { score: 8, reasoning: "Demonstrates full-stack integration and problem solving." },
                    placementWeightage: { level: "High", explanation: "High demand in backend and DevOps." }
                },
                {
                    id: "fallback-proj-2",
                    title: "Decentralized Credential Verifier",
                    problemStatement: "Organizations need a tamper-proof mechanism to issue and verify digital certificates.",
                    keyFeatures: ["Immutable Ledger", "API Gateway", "Verification Portal"],
                    techStack: languages.length > 0 ? [...languages, "Docker"] : ["Go", "React"],
                    difficulty: { level: level, justification: "Appropriate complexity." },
                    resumeWeightage: { score: 9, reasoning: "Shows understanding of distributed systems." },
                    placementWeightage: { level: "Medium", explanation: "Niche but rapidly expanding." }
                }
            ]
        };

        let finalResponse = fallbackProjects;

        try {
            const aiData = await generateJSON(prompt);
            if (aiData && aiData.projects && Array.isArray(aiData.projects) && aiData.projects.length > 0) {
                finalResponse = aiData;
            }
        } catch (aiError) {
            console.error("Gemini AI failed for Project Generator, using fallback", aiError);
        }

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Generate Projects Error:", error);
        res.status(500).json({ message: "Server error processing generation." });
    }
};

module.exports = {
    generateProjects
};
