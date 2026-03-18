import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getAnalyticsSummary } from '../services/analyticsService.js';
import UserProgress from '../models/UserProgress.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * GET /api/analytics/progress
 * Get user progress overview
 */
router.get('/progress', verifyToken, async (req, res) => {
    try {
        const summary = await getAnalyticsSummary(req.user.userId);
        res.json(summary);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Failed to get progress' });
    }
});

/**
 * GET /api/analytics/stats
 * Get detailed statistics
 */
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user.userId });

        if (!progress) {
            return res.json({
                totalSessions: 0,
                totalDuration: 0,
                averageScores: { fluency: 0, grammar: 0, vocabulary: 0 },
            });
        }

        // Get session breakdown by type
        const sessionsByType = await Session.aggregate([
            { $match: { userId: progress.userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                }
            },
        ]);

        // Get recent score trends
        const recentSessions = await Session.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('analysis createdAt');

        const scoreTrends = recentSessions.reverse().map(s => ({
            date: s.createdAt,
            fluency: s.analysis.fluencyScore,
            grammar: s.analysis.grammarScore,
            vocabulary: s.analysis.vocabularyScore,
        }));

        res.json({
            overview: {
                totalSessions: progress.totalSessions,
                totalDuration: progress.totalDuration,
                averageScores: progress.averageScores,
                level: progress.level,
                experiencePoints: progress.experiencePoints,
            },
            sessionsByType,
            scoreTrends,
            streaks: {
                current: progress.currentStreak,
                longest: progress.longestStreak,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Failed to get stats' });
    }
});

/**
 * GET /api/analytics/weaknesses
 * Get identified weaknesses
 */
router.get('/weaknesses', verifyToken, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user.userId });

        if (!progress) {
            return res.json({ weaknesses: [] });
        }

        res.json({
            weaknesses: progress.weaknesses.slice(0, 10),
            totalIdentified: progress.weaknesses.length,
        });
    } catch (error) {
        console.error('Get weaknesses error:', error);
        res.status(500).json({ message: 'Failed to get weaknesses' });
    }
});

/**
 * GET /api/analytics/achievements
 * Get user achievements
 */
router.get('/achievements', verifyToken, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user.userId });

        if (!progress) {
            return res.json({ achievements: [] });
        }

        res.json({
            achievements: progress.achievements,
            totalEarned: progress.achievements.length,
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Failed to get achievements' });
    }
});

/**
 * GET /api/analytics/weekly
 * Get weekly breakdown
 */
router.get('/weekly', verifyToken, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user.userId });

        if (!progress) {
            return res.json({ weeklyStats: [] });
        }

        res.json({
            weeklyStats: progress.weeklyStats,
        });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({ message: 'Failed to get weekly stats' });
    }
});

export default router;
