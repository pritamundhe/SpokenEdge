import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            select: false,
        },
        profileImage: {
            type: String,
            default: '',
        },
        preferredLanguage: {
            type: String,
            default: 'en-US',
        },
        nativeLanguage: {
            type: String,
            default: 'en',
        },
        learningGoals: [String],
        settings: {
            autoPlayAI: { type: Boolean, default: true },
            showGrammarHints: { type: Boolean, default: true },
            difficultyLevel: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced'],
                default: 'intermediate'
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model('User', UserSchema);
