import mongoose from 'mongoose';

const RoleplayScenarioSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
        },
        category: {
            type: String,
            enum: ['job_interview', 'travel', 'casual', 'business', 'medical', 'shopping', 'restaurant'],
            required: true,
        },
        language: {
            type: String,
            default: 'en-US',
        },
        systemPrompt: {
            type: String,
            required: true,
        },
        initialMessage: {
            type: String,
            required: true,
        },
        expectedTopics: [String],
        suggestedVocabulary: [
            {
                word: String,
                definition: String,
                example: String,
            },
        ],
        objectives: [
            {
                description: String,
                keywords: [String],
            },
        ],
        estimatedDuration: {
            type: Number, // in minutes
            default: 5,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for filtering
RoleplayScenarioSchema.index({ category: 1, difficulty: 1, language: 1 });
RoleplayScenarioSchema.index({ isActive: 1 });

export default mongoose.model('RoleplayScenario', RoleplayScenarioSchema);
