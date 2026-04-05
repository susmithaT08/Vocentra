const Resume = require('../models/Resume');
const { generateJSON } = require('../utils/geminiClient');

// @desc    Create a new resume
// @route   POST /api/resume/create
// @access  Private
const createResume = async (req, res) => {
    try {
        const {
            title, fullName, email, phone, linkedin, targetJobRole,
            careerObjective, education, skills, projects, experience, certifications
        } = req.body;

        const extractNames = (arr) => arr ? arr.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join(', ') : 'None';

        const prompt = `
You are an expert ATS optimizer and resume writer.
Given the user's details below, generate a professional resume text block (plain text with formatting) and evaluate its ATS score against standard industry requirements.

Ensure your response strictly follows this JSON schema:
{
  "generatedResumeText": "string",
  "generatedAtsScore": number // A score between 0 and 100
}

User Info:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
LinkedIn: ${linkedin || 'None'}
Target Role: ${targetJobRole}
Objective: ${careerObjective || 'Auto-generate a strong objective.'}
Education: ${extractNames(education)}
Skills: ${extractNames(skills)}
Experience: ${extractNames(experience)}
Projects: ${extractNames(projects)}
Certifications: ${extractNames(certifications)}
`;
        
        let generatedResumeText = "";
        let generatedAtsScore = 75;

        try {
            const aiResponse = await generateJSON(prompt);
            generatedResumeText = aiResponse.generatedResumeText;
            generatedAtsScore = aiResponse.generatedAtsScore || 75;
        } catch (aiError) {
            console.error("Gemini AI failed for Resume Builder, using fallback", aiError.message);
            generatedResumeText = `
${fullName}
${email} | ${phone}
${linkedin || ''}

OBJECTIVE
Professional ${targetJobRole} with a strong foundation in ${extractNames(skills)}.

SKILLS
${extractNames(skills)}

EXPERIENCE
${extractNames(experience)}

PROJECTS
${extractNames(projects)}

EDUCATION
${extractNames(education)}

CERTIFICATIONS
${extractNames(certifications)}
`.trim();
        }

        const resume = await Resume.create({
            userId: req.user.id,
            title,
            fullName,
            email,
            phone,
            linkedin: linkedin || '',
            targetJobRole,
            careerObjective: careerObjective || '',
            education: education || [],
            skills: skills || [],
            projects: projects || [],
            experience: experience || [],
            certifications: certifications || [],
            resumeText: generatedResumeText,
            atsScore: generatedAtsScore
        });

        // Ensure we send back the document with the newly generated fields
        res.status(201).json({
            message: 'Resume generated successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user resumes
// @route   GET /api/resume/user/:userId
// @access  Private
const getUserResumes = async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const userResumes = await Resume.find({ userId: req.params.userId });
        res.status(200).json(userResumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a resume
// @route   PUT /api/resume/update/:resumeId
// @access  Private
const updateResume = async (req, res) => {
    try {
        let resume = await Resume.findById(req.params.resumeId);
        if (!resume) return res.status(404).json({ message: 'Resume not found' });

        if (resume.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        resume = await Resume.findByIdAndUpdate(req.params.resumeId, req.body, { new: true });
        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/delete/:resumeId
// @access  Private
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);
        if (!resume) return res.status(404).json({ message: 'Resume not found' });

        if (resume.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await resume.deleteOne();
        res.status(200).json({ id: req.params.resumeId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createResume, getUserResumes, updateResume, deleteResume };
