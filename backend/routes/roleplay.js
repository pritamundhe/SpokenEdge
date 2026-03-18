import express from 'express';
import RoleplayScenario from '../models/RoleplayScenario.js';
import Session from '../models/Session.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getAIResponse, checkObjectives, getScenarioFeedback, getRecommendedScenarios } from '../services/roleplayService.js';

const router = express.Router();

/**
 * GET /api/roleplay/scenarios
 * List available roleplay scenarios
 */
router.get('/scenarios', verifyToken, async (req, res) => {
    try {
        const { category, difficulty, language } = req.query;

        const filter = { isActive: true };
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (language) filter.language = language;

        const scenarios = await RoleplayScenario.find(filter)
            .select('-systemPrompt') // Don't expose system prompt in list
            .sort({ usageCount: 1, createdAt: -1 });

        res.json({ scenarios });
    } catch (error) {
        console.error('Get scenarios error:', error);
        res.status(500).json({ message: 'Failed to get scenarios' });
    }
});

/**
 * GET /api/roleplay/scenarios/:id
 * Get specific scenario details
 */
router.get('/scenarios/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const scenario = await RoleplayScenario.findById(id);
        if (!scenario) {
            return res.status(404).json({ message: 'Scenario not found' });
        }

        res.json({ scenario });
    } catch (error) {
        console.error('Get scenario error:', error);
        res.status(500).json({ message: 'Failed to get scenario' });
    }
});

/**
 * POST /api/roleplay/start
 * Start a roleplay session
 */
router.post('/start', verifyToken, async (req, res) => {
    try {
        const { scenarioId } = req.body;

        const scenario = await RoleplayScenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ message: 'Scenario not found' });
        }

        // Create session
        const session = new Session({
            userId: req.user.userId,
            type: 'roleplay',
            scenario: scenario.title,
            language: scenario.language,
            startTime: new Date(),
            transcript: [],
        });

        // Add initial AI message
        session.transcript.push({
            speaker: 'ai',
            text: scenario.initialMessage,
            timestamp: new Date(),
        });

        await session.save();

        // Increment usage count
        scenario.usageCount += 1;
        await scenario.save();

        res.json({
            message: 'Roleplay session started',
            sessionId: session._id,
            initialMessage: scenario.initialMessage,
            objectives: scenario.objectives,
            suggestedVocabulary: scenario.suggestedVocabulary,
        });
    } catch (error) {
        console.error('Start roleplay error:', error);
        res.status(500).json({ message: 'Failed to start roleplay' });
    }
});

/**
 * POST /api/roleplay/:sessionId/respond
 * Get AI response in roleplay
 */
router.post('/:sessionId/respond', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userMessage, sentimentData } = req.body;

        const session = await Session.findOne({ _id: sessionId, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const scenario = await RoleplayScenario.findOne({ title: session.scenario });
        if (!scenario) {
            return res.status(404).json({ message: 'Scenario not found' });
        }

        // Add user message to transcript
        session.transcript.push({
            speaker: 'user',
            text: userMessage,
            timestamp: new Date(),
            sentiment: sentimentData || null,
        });

        // Get AI response
        const aiResponse = await getAIResponse(
            scenario.systemPrompt,
            session.transcript,
            userMessage
        );

        // Add AI response to transcript
        session.transcript.push({
            speaker: 'ai',
            text: aiResponse,
            timestamp: new Date(),
        });

        await session.save();

        // Check objectives progress
        const objectivesStatus = checkObjectives(scenario, session.transcript);

        res.json({
            aiResponse,
            objectivesStatus,
        });
    } catch (error) {
        console.error('Roleplay respond error:', error);
        res.status(500).json({ message: 'Failed to get AI response' });
    }
});

/**
 * POST /api/roleplay/:sessionId/end
 * End roleplay session with scenario-specific feedback
 */
router.post('/:sessionId/end', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ _id: sessionId, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const scenario = await RoleplayScenario.findOne({ title: session.scenario });

        session.endTime = new Date();
        session.duration = Math.round((session.endTime - session.startTime) / 1000);

        // Basic analysis (full analysis done via session/end endpoint)
        const objectivesStatus = scenario ? checkObjectives(scenario, session.transcript) : null;

        await session.save();

        // Get scenario-specific feedback
        const feedback = scenario && session.analysis
            ? getScenarioFeedback(scenario, session.analysis, objectivesStatus)
            : null;

        // Get recommended scenarios
        const recommended = scenario
            ? await getRecommendedScenarios(req.user.userId, scenario.difficulty, scenario.category)
            : [];

        res.json({
            message: 'Roleplay session ended',
            objectivesStatus,
            feedback,
            recommended,
        });
    } catch (error) {
        console.error('End roleplay error:', error);
        res.status(500).json({ message: 'Failed to end roleplay' });
    }
});

/**
 * GET /api/roleplay/categories
 * Get available categories
 */
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const categories = await RoleplayScenario.distinct('category', { isActive: true });
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Failed to get categories' });
    }
});

export default router;
