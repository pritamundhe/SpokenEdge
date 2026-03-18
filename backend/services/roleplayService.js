import RoleplayScenario from '../models/RoleplayScenario.js';
import fetch from 'node-fetch';

/**
 * Get AI response for roleplay conversation
 * @param {string} scenario - Scenario system prompt
 * @param {Array} conversationHistory - Previous messages
 * @param {string} userMessage - Current user message
 * @returns {Promise<string>} AI response
 */
export async function getAIResponse(scenario, conversationHistory, userMessage) {
    try {
        const messages = [
            { role: 'system', content: scenario },
            ...conversationHistory.map(msg => ({
                role: msg.speaker === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: 0.7,
                max_tokens: 150,
            })
        });

        if (!response.ok) {
            throw new Error('DeepSeek API error');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI Response Error:', error);
        throw error;
    }
}

/**
 * Check if conversation objectives are met
 * @param {Object} scenario - Roleplay scenario
 * @param {Array} transcript - Conversation transcript
 * @returns {Object} Objectives completion status
 */
export function checkObjectives(scenario, transcript) {
    if (!scenario.objectives || scenario.objectives.length === 0) {
        return { completed: [], total: 0, percentage: 100 };
    }

    const userMessages = transcript
        .filter(t => t.speaker === 'user')
        .map(t => t.text.toLowerCase())
        .join(' ');

    const completed = scenario.objectives.filter(objective => {
        // Check if any of the objective keywords appear in user messages
        return objective.keywords.some(keyword =>
            userMessages.includes(keyword.toLowerCase())
        );
    });

    return {
        completed: completed.map(obj => obj.description),
        total: scenario.objectives.length,
        percentage: Math.round((completed.length / scenario.objectives.length) * 100),
    };
}

/**
 * Get scenario-specific feedback
 * @param {Object} scenario - Roleplay scenario
 * @param {Object} sessionAnalysis - Session analysis data
 * @param {Object} objectives - Objectives completion status
 * @returns {Object} Detailed feedback
 */
export function getScenarioFeedback(scenario, sessionAnalysis, objectives) {
    const feedback = {
        overall: '',
        strengths: [],
        improvements: [],
        objectivesStatus: objectives,
        vocabularyUsed: [],
        nextSteps: [],
    };

    // Overall assessment
    const avgScore = (
        sessionAnalysis.fluencyScore +
        sessionAnalysis.grammarScore +
        sessionAnalysis.vocabularyScore
    ) / 3;

    if (avgScore >= 80) {
        feedback.overall = 'Excellent performance! You handled this scenario very well.';
    } else if (avgScore >= 60) {
        feedback.overall = 'Good effort! You showed understanding of the scenario.';
    } else {
        feedback.overall = 'Keep practicing! This scenario is challenging but you\'re making progress.';
    }

    // Identify strengths
    if (sessionAnalysis.fluencyScore >= 70) {
        feedback.strengths.push('Maintained good speaking flow and pace');
    }
    if (sessionAnalysis.grammarScore >= 80) {
        feedback.strengths.push('Used correct grammar throughout');
    }
    if (sessionAnalysis.vocabularyScore >= 75) {
        feedback.strengths.push('Demonstrated varied vocabulary');
    }
    if (objectives.percentage >= 70) {
        feedback.strengths.push('Covered most scenario objectives');
    }

    // Suggest improvements
    if (sessionAnalysis.fluencyScore < 70) {
        feedback.improvements.push('Practice speaking more smoothly with fewer pauses');
    }
    if (sessionAnalysis.grammarScore < 70) {
        feedback.improvements.push('Review common grammar patterns for this scenario');
    }
    if (sessionAnalysis.vocabularyScore < 70) {
        feedback.improvements.push('Expand vocabulary related to ' + scenario.category.replace('_', ' '));
    }
    if (objectives.percentage < 70) {
        feedback.improvements.push('Try to cover all conversation objectives');
    }

    // Next steps
    if (scenario.difficulty === 'beginner' && avgScore >= 75) {
        feedback.nextSteps.push('Try an intermediate level scenario in this category');
    } else if (scenario.difficulty === 'intermediate' && avgScore >= 75) {
        feedback.nextSteps.push('Challenge yourself with an advanced scenario');
    } else {
        feedback.nextSteps.push('Practice this scenario again to improve your score');
    }

    return feedback;
}

/**
 * Get recommended scenarios based on user performance
 * @param {string} userId - User ID
 * @param {string} currentDifficulty - Current difficulty level
 * @param {string} category - Scenario category
 * @returns {Promise<Array>} Recommended scenarios
 */
export async function getRecommendedScenarios(userId, currentDifficulty, category) {
    try {
        // Get scenarios of similar or slightly higher difficulty
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        const currentIndex = difficulties.indexOf(currentDifficulty);
        const targetDifficulties = difficulties.slice(currentIndex, currentIndex + 2);

        const scenarios = await RoleplayScenario.find({
            isActive: true,
            difficulty: { $in: targetDifficulties },
            category: category,
        })
            .limit(3)
            .sort({ usageCount: 1 }); // Prefer less-used scenarios

        return scenarios;
    } catch (error) {
        console.error('Error getting recommended scenarios:', error);
        return [];
    }
}

export default {
    getAIResponse,
    checkObjectives,
    getScenarioFeedback,
    getRecommendedScenarios,
};
