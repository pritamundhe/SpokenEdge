import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        language: {
            type: String,
            default: 'en-US',
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
        totalDuration: {
            type: Number, // in seconds
            default: 0,
        },
        averageScores: {
            fluency: {
                type: Number,
                default: 0,
            },
            grammar: {
                type: Number,
                default: 0,
            },
            vocabulary: {
                type: Number,
                default: 0,
            },
        },
        weeklyStats: [
            {
                weekStart: Date,
                sessions: Number,
                duration: Number,
                improvements: {
                    fluency: Number,
                    grammar: Number,
                    vocabulary: Number,
                },
                topScenarios: [String],
            },
        ],
        weaknesses: [
            {
                type: {
                    type: String,
                    enum: ['grammar', 'vocabulary', 'pronunciation', 'fluency'],
                },
                category: String, // e.g., 'past_tense', 'articles', 'prepositions'
                description: String,
                frequency: {
                    type: Number,
                    default: 1,
                },
                lastOccurrence: Date,
                examples: [String],
            },
        ],
        achievements: [
            {
                name: String,
                description: String,
                earnedAt: Date,
                icon: String,
            },
        ],
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastSessionDate: {
            type: Date,
            default: null,
        },
        level: {
            type: Number,
            default: 1,
        },
        experiencePoints: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for user lookup
UserProgressSchema.index({ userId: 1 });

export default mongoose.model('UserProgress', UserProgressSchema);
