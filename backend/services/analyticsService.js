import Session from '../models/Session.js';
import UserProgress from '../models/UserProgress.js';

/**
 * Calculate fluency score based on various metrics
 * @param {Object} sessionData - Session data including transcript and timing
 * @returns {number} Fluency score from 0-100
 */
export function calculateFluencyScore(sessionData) {
    const { transcript, duration, analysis } = sessionData;

    if (!transcript || transcript.length === 0) return 0;

    // Metrics for fluency
    const userMessages = transcript.filter(t => t.speaker === 'user');
    const totalWords = analysis.totalWords || 0;
    const wordsPerMinute = duration > 0 ? (totalWords / (duration / 60)) : 0;

    // Calculate pause frequency (time between messages)
    let totalPauses = 0;
    let pauseCount = 0;
    for (let i = 1; i < userMessages.length; i++) {
        const pause = (new Date(userMessages[i].timestamp) - new Date(userMessages[i - 1].timestamp)) / 1000;
        if (pause > 2) { // Count pauses longer than 2 seconds
            totalPauses += pause;
            pauseCount++;
        }
    }
    const avgPause = pauseCount > 0 ? totalPauses / pauseCount : 0;

    // Scoring components
    // 1. Speaking rate (40% weight) - optimal is 120-150 WPM
    let rateScore = 0;
    if (wordsPerMinute >= 120 && wordsPerMinute <= 150) {
        rateScore = 40;
    } else if (wordsPerMinute > 150) {
        rateScore = Math.max(0, 40 - ((wordsPerMinute - 150) / 10));
    } else {
        rateScore = (wordsPerMinute / 120) * 40;
    }

    // 2. Pause management (30% weight) - fewer long pauses is better
    const pauseScore = Math.max(0, 30 - (avgPause * 2));

    // 3. Response consistency (30% weight)
    const consistencyScore = userMessages.length > 3 ? 30 : (userMessages.length / 3) * 30;

    return Math.round(rateScore + pauseScore + consistencyScore);
}

/**
 * Update user progress after a session
 * @param {string} userId - User ID
 * @param {Object} sessionAnalysis - Session analysis data
 * @returns {Promise<Object>} Updated progress
 */
export async function updateUserProgress(userId, sessionAnalysis) {
    try {
        let progress = await UserProgress.findOne({ userId });

        if (!progress) {
            progress = new UserProgress({
                userId,
                language: sessionAnalysis.language || 'en-US',
            });
        }

        // Update totals
        progress.totalSessions += 1;
        progress.totalDuration += sessionAnalysis.duration;

        // Update average scores (weighted average)
        const weight = progress.totalSessions;
        progress.averageScores.fluency =
            ((progress.averageScores.fluency * (weight - 1)) + sessionAnalysis.fluencyScore) / weight;
        progress.averageScores.grammar =
            ((progress.averageScores.grammar * (weight - 1)) + sessionAnalysis.grammarScore) / weight;
        progress.averageScores.vocabulary =
            ((progress.averageScores.vocabulary * (weight - 1)) + sessionAnalysis.vocabularyScore) / weight;

        // Update streak
        const today = new Date().setHours(0, 0, 0, 0);
        const lastSession = progress.lastSessionDate ? new Date(progress.lastSessionDate).setHours(0, 0, 0, 0) : null;

        if (lastSession) {
            const daysDiff = (today - lastSession) / (1000 * 60 * 60 * 24);
            if (daysDiff === 1) {
                progress.currentStreak += 1;
            } else if (daysDiff > 1) {
                progress.currentStreak = 1;
            }
        } else {
            progress.currentStreak = 1;
        }

        if (progress.currentStreak > progress.longestStreak) {
            progress.longestStreak = progress.currentStreak;
        }

        progress.lastSessionDate = new Date();

        // Update weekly stats
        updateWeeklyStats(progress, sessionAnalysis);

        // Check for achievements
        checkAchievements(progress);

        // Update level and XP
        progress.experiencePoints += calculateXP(sessionAnalysis);
        progress.level = Math.floor(progress.experiencePoints / 1000) + 1;

        await progress.save();
        return progress;
    } catch (error) {
        console.error('Error updating user progress:', error);
        throw error;
    }
}

/**
 * Update weekly statistics
 * @param {Object} progress - UserProgress document
 * @param {Object} sessionAnalysis - Session analysis data
 */
function updateWeeklyStats(progress, sessionAnalysis) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    let currentWeek = progress.weeklyStats.find(
        w => new Date(w.weekStart).getTime() === weekStart.getTime()
    );

    if (!currentWeek) {
        currentWeek = {
            weekStart,
            sessions: 0,
            duration: 0,
            improvements: { fluency: 0, grammar: 0, vocabulary: 0 },
            topScenarios: [],
        };
        progress.weeklyStats.push(currentWeek);
    }

    currentWeek.sessions += 1;
    currentWeek.duration += sessionAnalysis.duration;

    // Keep only last 12 weeks
    if (progress.weeklyStats.length > 12) {
        progress.weeklyStats = progress.weeklyStats.slice(-12);
    }
}

/**
 * Identify and track user weaknesses
 * @param {string} userId - User ID
 * @param {Array} grammarErrors - Grammar errors from session
 * @returns {Promise<void>}
 */
export async function trackWeaknesses(userId, grammarErrors) {
    try {
        const progress = await UserProgress.findOne({ userId });
        if (!progress) return;

        grammarErrors.forEach(error => {
            const existingWeakness = progress.weaknesses.find(
                w => w.category === error.rule
            );

            if (existingWeakness) {
                existingWeakness.frequency += 1;
                existingWeakness.lastOccurrence = new Date();
                if (existingWeakness.examples.length < 5) {
                    existingWeakness.examples.push(error.context);
                }
            } else {
                progress.weaknesses.push({
                    type: 'grammar',
                    category: error.rule,
                    description: error.message,
                    frequency: 1,
                    lastOccurrence: new Date(),
                    examples: [error.context],
                });
            }
        });

        // Keep only top 20 weaknesses by frequency
        progress.weaknesses.sort((a, b) => b.frequency - a.frequency);
        progress.weaknesses = progress.weaknesses.slice(0, 20);

        await progress.save();
    } catch (error) {
        console.error('Error tracking weaknesses:', error);
    }
}

/**
 * Check and award achievements
 * @param {Object} progress - UserProgress document
 */
function checkAchievements(progress) {
    const achievements = [];

    // First session
    if (progress.totalSessions === 1) {
        achievements.push({
            name: 'First Steps',
            description: 'Completed your first practice session',
            earnedAt: new Date(),
            icon: '🎯',
        });
    }

    // Streak achievements
    if (progress.currentStreak === 7) {
        achievements.push({
            name: 'Week Warrior',
            description: '7-day practice streak',
            earnedAt: new Date(),
            icon: '🔥',
        });
    }

    if (progress.currentStreak === 30) {
        achievements.push({
            name: 'Monthly Master',
            description: '30-day practice streak',
            earnedAt: new Date(),
            icon: '🏆',
        });
    }

    // Session count achievements
    if (progress.totalSessions === 10) {
        achievements.push({
            name: 'Dedicated Learner',
            description: 'Completed 10 practice sessions',
            earnedAt: new Date(),
            icon: '📚',
        });
    }

    if (progress.totalSessions === 50) {
        achievements.push({
            name: 'Practice Pro',
            description: 'Completed 50 practice sessions',
            earnedAt: new Date(),
            icon: '⭐',
        });
    }

    // Score achievements
    if (progress.averageScores.fluency >= 90) {
        achievements.push({
            name: 'Fluency Master',
            description: 'Achieved 90+ average fluency score',
            earnedAt: new Date(),
            icon: '🎤',
        });
    }

    // Add new achievements (avoid duplicates)
    achievements.forEach(newAch => {
        const exists = progress.achievements.some(a => a.name === newAch.name);
        if (!exists) {
            progress.achievements.push(newAch);
        }
    });
}

/**
 * Calculate experience points for a session
 * @param {Object} sessionAnalysis - Session analysis data
 * @returns {number} XP earned
 */
function calculateXP(sessionAnalysis) {
    const baseXP = 50;
    const scoreBonus = Math.round(
        (sessionAnalysis.fluencyScore + sessionAnalysis.grammarScore + sessionAnalysis.vocabularyScore) / 3
    );
    const durationBonus = Math.min(Math.round(sessionAnalysis.duration / 60) * 10, 50);

    return baseXP + scoreBonus + durationBonus;
}

/**
 * Get user analytics summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Analytics summary
 */
export async function getAnalyticsSummary(userId) {
    try {
        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
            return {
                totalSessions: 0,
                averageScores: { fluency: 0, grammar: 0, vocabulary: 0 },
                currentStreak: 0,
                level: 1,
            };
        }

        const recentSessions = await Session.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('analysis createdAt type');

        return {
            totalSessions: progress.totalSessions,
            totalDuration: progress.totalDuration,
            averageScores: progress.averageScores,
            currentStreak: progress.currentStreak,
            longestStreak: progress.longestStreak,
            level: progress.level,
            experiencePoints: progress.experiencePoints,
            achievements: progress.achievements,
            weeklyStats: progress.weeklyStats,
            topWeaknesses: progress.weaknesses.slice(0, 5),
            recentSessions,
        };
    } catch (error) {
        console.error('Error getting analytics summary:', error);
        throw error;
    }
}

export default {
    calculateFluencyScore,
    updateUserProgress,
    trackWeaknesses,
    getAnalyticsSummary,
};
