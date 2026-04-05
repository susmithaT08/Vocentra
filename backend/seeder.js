const User = require('./models/User');
const Resume = require('./models/Resume');
const Interview = require('./models/Interview');
const Skill = require('./models/Skill');
const LinkedinHistory = require('./models/LinkedinHistory');
const GlobalWord = require('./models/GlobalWord');
const fs = require('fs');
const path = require('path');

const seedData = async () => {
    try {
        // Clear DB
        await User.deleteMany();
        await Resume.deleteMany();
        await Interview.deleteMany();
        await Skill.deleteMany();
        await LinkedinHistory.deleteMany();
        await GlobalWord.deleteMany();

        // Create Dummy User
        const user = await User.create({
            _id: '65cf575561cd766b5c9ba080',
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'password123'
        });

        console.log(`Created dummy user: ${user.email} (ID: ${user._id})`);

        // Create Dummy Resume
        await Resume.create({
            userId: user._id,
            title: 'Senior Frontend Developer Resume',
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '123-456-7890',
            targetJobRole: 'Senior Frontend Developer',
            education: [{ school: 'Tech University', degree: 'BS Computer Science', year: '2020' }],
            skills: ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
            projects: [{ name: 'Vocentra Dashboard', description: 'Built an interactive skill dashboard' }],
            experience: [{ company: 'Tech Corp', role: 'Frontend Engineer', duration: '2021-Present' }],
            resumeText: 'Jane Doe\njane@example.com\n\nSenior Frontend Developer with 5 years of experience...',
            atsScore: 85
        });

        // Create Dummy Interview History
        const interview = await Interview.create({
            userId: user._id,
            mode: 'RECORDED',
            companySimulation: 'General',
            status: 'COMPLETED',
            questions: [
                {
                    round: 'HR',
                    questionText: 'Tell me about a time you overcame a significant challenge.',
                    userTranscript: 'I overcome challenges by breaking them down into small steps.',
                    durationSeconds: 45,
                    feedback: {
                        mistakes: ['Answer too brief.', 'Lacks STAR structure.'],
                        suggestion: 'Provide a real-world example with context, action, and result.',
                        betterSample: 'In my last role, we faced X... I did Y... which resulted in Z.',
                        score: 70
                    }
                },
                {
                    round: 'Technical',
                    questionText: 'Can you explain the difference between a process and a thread?',
                    userTranscript: 'A process is an executing program, while a thread is a segment of a process.',
                    durationSeconds: 30,
                    feedback: {
                        mistakes: [],
                        suggestion: 'Good concise answer. Try mentioning memory isolation to show deeper understanding.',
                        betterSample: 'A process has its own isolated memory space, whereas a thread shares memory with other threads within the same process.',
                        score: 85
                    }
                }
            ],
            overallMetrics: {
                overallScore: 78,
                communicationIndex: 83,
                technicalStrengthIndex: 76,
                leadershipReadiness: 80,
                confidenceLevel: 86
            },
            recommendedFocusAreas: ['Using STAR method', 'Providing deeper technical context'],
            personalizedPlan: 'Practice structuring your behavioral answers to include specific outcomes. For technical concepts, always relate definitions to real-world memory or performance impacts.',
            date: new Date()
        });

        // Create Dummy Skills Progress
        await Skill.create({
            userId: user._id,
            assessmentId: interview._id,
            overall_employability_score: 85,
            employability_level: 'Highly Job Ready',
            progressData: {
                'communication': 72,
                'leadership': 65,
                'collaboration': 88,
                'time_management': 90
            }
        });

        // Create Dummy LinkedIn History
        await LinkedinHistory.create({
            userId: user._id,
            profileUrl: 'https://linkedin.com/in/janedoe',
            analysisResult: 'Excellent use of keywords. Add a professional summary.',
            score: 92
        });

        const dictionaryPath = path.join(__dirname, 'seeders', 'dictionary.json');
        if (fs.existsSync(dictionaryPath)) {
            const dictionaryData = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
            await GlobalWord.insertMany(dictionaryData);
            console.log(`Seeded ${dictionaryData.length} Global Words!`);
        }

        console.log('Dummy Data Seeded Successfully!');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = seedData;
