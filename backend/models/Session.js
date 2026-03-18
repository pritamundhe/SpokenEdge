import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['practice', 'roleplay'],
            required: true,
        },
        scenario: {
            type: String,
            default: null,
        },
        language: {
            type: String,
            default: 'en-US',
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            default: null,
        },
        transcript: [
            {
                speaker: {
                    type: String,
                    enum: ['user', 'ai'],
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    required: true,
                },
                sentiment: {
                    label: String, // 'positive', 'negative', 'neutral'
                    confidence: Number,
                    emotions: {
                        type: Map,
                        of: Number,
                    },
                },
                grammarIssues: [
                    {
                        message: String,
                        offset: Number,
                        length: Number,
                        rule: String,
                        suggestions: [String],
                    },
                ],
            },
        ],
        analysis: {
            fluencyScore: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
            },
            grammarScore: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
            },
            vocabularyScore: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
            },
            sentimentBreakdown: {
                positive: { type: Number, default: 0 },
                negative: { type: Number, default: 0 },
                neutral: { type: Number, default: 0 },
            },
            totalWords: {
                type: Number,
                default: 0,
            },
            uniqueWords: {
                type: Number,
                default: 0,
            },
            averageResponseTime: {
                type: Number,
                default: 0,
            },
        },
        duration: {
            type: Number, // in seconds
            default: 0,
        },
        userFeedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: String,
        },
    },
    { timestamps: true }
);

// Index for faster queries
SessionSchema.index({ userId: 1, createdAt: -1 });
SessionSchema.index({ type: 1, language: 1 });

export default mongoose.model('Session', SessionSchema);
