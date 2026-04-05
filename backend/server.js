const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
const seedData = require('./seeder');

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // In development, allow all localhost/LAN origins
        if (process.env.NODE_ENV !== 'production') {
            if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/)) {
                return callback(null, true);
            }
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json()); // Body parser

// Route files
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const linkedinRoutes = require('./routes/linkedinRoutes');
const speakingRoutes = require('./routes/speakingRoutes');
const vocabularyRoutes = require('./routes/vocabularyRoutes');
const progressRoutes = require('./routes/progressRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eiRoutes = require('./routes/eiRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ei', eiRoutes);
const emotionalFeedbackRoutes = require('./routes/emotionalFeedbackRoutes');
app.use('/api/emotional-feedback', emotionalFeedbackRoutes);
const confidenceRoutes = require('./routes/confidenceRoutes');
app.use('/api/analyze-confidence', confidenceRoutes);
const socialRoutes = require('./routes/socialRoutes');
app.use('/api/social-chat', socialRoutes);
const discoveryRoutes = require('./routes/discoveryRoutes');
app.use('/api/self-discovery-insights', discoveryRoutes);
const grammarRoutes = require('./routes/grammarRoutes');
app.use('/api/grammar-check', grammarRoutes);
const conversationRoutes = require('./routes/conversationRoutes');
app.use('/api/conversation-chat', conversationRoutes);
const analyzerRoutes = require('./routes/speakingRoutes');
app.use('/api/speech-analysis', analyzerRoutes);
const mindsetRoutes = require('./routes/mindsetRoutes');
app.use('/api/mindset-reframe', mindsetRoutes);
const projectGeneratorRoutes = require('./routes/projectGeneratorRoutes');
app.use('/api/project-generator', projectGeneratorRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Vocentra Career Backend API is running...');
});

// 404 handler for API routes
app.use((req, res, next) => {
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    // await seedData();//
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

startServer();
