import express from 'express';
import Session from '../models/Session.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { checkGrammar, analyzeVocabulary, analyzeSentenceStructure, calculateGrammarScore } from '../services/grammarService.js';
import { analyzeSentiment, extractEmotions } from '../services/speechService.js';
import { calculateFluencyScore, updateUserProgress, trackWeaknesses } from '../services/analyticsService.js';

const router = express.Router();

/**
 * POST /api/session/start
 * Start a new practice session
 */
router.post('/start', verifyToken, async (req, res) => {
    try {
        const { type, scenario, language } = req.body;

        const session = new Session({
            userId: req.user.userId,
            type: type || 'practice',
            scenario,
            language: language || 'en-US',
            startTime: new Date(),
            transcript: [],
        });

        await session.save();

        res.json({
            message: 'Session started',
            sessionId: session._id,
            startTime: session.startTime,
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ message: 'Failed to start session' });
    }
});

/**
 * POST /api/session/:id/message
 * Add a message to the session transcript
 */
router.post('/:id/message', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { speaker, text, sentimentData } = req.body;

        const session = await Session.findOne({ _id: id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Analyze grammar for user messages
        let grammarIssues = [];
        if (speaker === 'user' && text) {
            const grammarResult = await checkGrammar(text, session.language);
            grammarIssues = grammarResult.errors;
        }

        // Add message to transcript
        session.transcript.push({
            speaker,
            text,
            timestamp: new Date(),
            sentiment: sentimentData || null,
            grammarIssues,
        });

        await session.save();

        res.json({
            message: 'Message added',
            grammarIssues,
        });
    } catch (error) {
        console.error('Add message error:', error);
        res.status(500).json({ message: 'Failed to add message' });
    }
});

/**
 * POST /api/session/:id/end
 * End session and calculate analysis
 */
router.post('/:id/end', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findOne({ _id: id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.endTime = new Date();
        session.duration = Math.round((session.endTime - session.startTime) / 1000);

        // Analyze the session
        const userMessages = session.transcript.filter(t => t.speaker === 'user');
        const allText = userMessages.map(m => m.text).join(' ');

        // Grammar analysis
        const allGrammarIssues = userMessages.flatMap(m => m.grammarIssues || []);
        const grammarScore = calculateGrammarScore(allGrammarIssues.length, allText.split(' ').length);

        // Vocabulary analysis
        const vocabAnalysis = analyzeVocabulary(allText);

        // Sentiment analysis
        const sentiments = userMessages
            .filter(m => m.sentiment)
            .map(m => ({ sentiment: m.sentiment.label, confidence: m.sentiment.confidence }));

        const sentimentBreakdown = sentiments.length > 0
            ? analyzeSentiment(sentiments.map(s => ({ sentiment: s.sentiment.toUpperCase(), confidence: s.confidence })))
            : { positive: 0, negative: 0, neutral: 100 };

        // Fluency score
        const fluencyScore = calculateFluencyScore({
            transcript: session.transcript,
            duration: session.duration,
            analysis: { totalWords: vocabAnalysis.totalWords },
        });

        // Update session analysis
        session.analysis = {
            fluencyScore,
            grammarScore,
            vocabularyScore: vocabAnalysis.score,
            sentimentBreakdown,
            totalWords: vocabAnalysis.totalWords,
            uniqueWords: vocabAnalysis.uniqueWords,
        };

        await session.save();

        // Update user progress
        await updateUserProgress(req.user.userId, {
            language: session.language,
            duration: session.duration,
            fluencyScore,
            grammarScore,
            vocabularyScore: vocabAnalysis.score,
        });

        // Track weaknesses
        await trackWeaknesses(req.user.userId, allGrammarIssues);

        res.json({
            message: 'Session ended',
            analysis: session.analysis,
            duration: session.duration,
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ message: 'Failed to end session' });
    }
});

/**
 * GET /api/session/history
 * Get user's session history
 */
router.get('/history', verifyToken, async (req, res) => {
    try {
        const { limit = 10, skip = 0 } = req.query;

        const sessions = await Session.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .select('-transcript'); // Exclude full transcript for performance

        const total = await Session.countDocuments({ userId: req.user.userId });

        res.json({
            sessions,
            total,
            hasMore: total > parseInt(skip) + parseInt(limit),
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Failed to get history' });
    }
});

/**
 * GET /api/session/:id
 * Get specific session details
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findOne({ _id: id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({ session });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ message: 'Failed to get session' });
    }
});

/**
 * POST /api/session/:id/feedback
 * Add user feedback to session
 */
router.post('/:id/feedback', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const session = await Session.findOne({ _id: id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.userFeedback = { rating, comment };
        await session.save();

        res.json({ message: 'Feedback saved' });
    } catch (error) {
        console.error('Save feedback error:', error);
        res.status(500).json({ message: 'Failed to save feedback' });
    }
});

export default router;
