import 'dotenv/config';
import mongoose from 'mongoose';
import RoleplayScenario from './models/RoleplayScenario.js';

const scenarios = [
    {
        title: 'Job Interview - Software Developer',
        description: 'Practice interviewing for a software developer position. Discuss your experience, skills, and answer technical questions.',
        difficulty: 'intermediate',
        category: 'job_interview',
        language: 'en-US',
        systemPrompt: 'You are a hiring manager conducting a job interview for a software developer position. Ask relevant questions about the candidate\'s experience, technical skills, and problem-solving abilities. Be professional but friendly. Keep responses concise (2-3 sentences).',
        initialMessage: 'Hello! Thank you for coming in today. Please tell me a bit about yourself and your experience in software development.',
        expectedTopics: ['experience', 'technical skills', 'projects', 'teamwork', 'problem-solving'],
        suggestedVocabulary: [
            { word: 'collaborate', definition: 'Work jointly with others', example: 'I collaborate with my team daily.' },
            { word: 'implement', definition: 'Put into effect', example: 'I implemented a new feature last month.' },
            { word: 'optimize', definition: 'Make as effective as possible', example: 'We optimized the database queries.' },
        ],
        objectives: [
            { description: 'Introduce yourself professionally', keywords: ['name', 'experience', 'background'] },
            { description: 'Discuss technical skills', keywords: ['programming', 'language', 'framework', 'technology'] },
            { description: 'Describe a project', keywords: ['project', 'built', 'developed', 'created'] },
        ],
        estimatedDuration: 5,
    },
    {
        title: 'Travel - Hotel Check-in',
        description: 'Practice checking into a hotel. Communicate your reservation details and special requests.',
        difficulty: 'beginner',
        category: 'travel',
        language: 'en-US',
        systemPrompt: 'You are a friendly hotel receptionist. Help the guest check in, ask for their reservation details, and assist with any requests. Be polite and helpful. Keep responses brief (1-2 sentences).',
        initialMessage: 'Good evening! Welcome to our hotel. Do you have a reservation with us?',
        expectedTopics: ['reservation', 'room type', 'check-in', 'amenities', 'requests'],
        suggestedVocabulary: [
            { word: 'reservation', definition: 'Booking arrangement', example: 'I have a reservation under Smith.' },
            { word: 'amenities', definition: 'Facilities and services', example: 'What amenities does the room have?' },
            { word: 'checkout', definition: 'Leaving the hotel', example: 'What time is checkout?' },
        ],
        objectives: [
            { description: 'Confirm reservation', keywords: ['reservation', 'booking', 'name'] },
            { description: 'Ask about room features', keywords: ['room', 'wifi', 'breakfast', 'amenities'] },
        ],
        estimatedDuration: 3,
    },
    {
        title: 'Restaurant - Ordering Food',
        description: 'Practice ordering food at a restaurant. Ask questions about the menu and place your order.',
        difficulty: 'beginner',
        category: 'restaurant',
        language: 'en-US',
        systemPrompt: 'You are a friendly waiter at a restaurant. Help the customer with menu questions and take their order. Be polite and helpful. Keep responses brief (1-2 sentences).',
        initialMessage: 'Good evening! Welcome to our restaurant. Can I start you off with something to drink?',
        expectedTopics: ['menu', 'order', 'drinks', 'allergies', 'recommendations'],
        suggestedVocabulary: [
            { word: 'appetizer', definition: 'Starter dish', example: 'I\'ll have the soup as an appetizer.' },
            { word: 'allergic', definition: 'Having an allergy to', example: 'I\'m allergic to peanuts.' },
            { word: 'recommend', definition: 'Suggest as good', example: 'What do you recommend?' },
        ],
        objectives: [
            { description: 'Order a drink', keywords: ['water', 'drink', 'beverage', 'wine', 'beer'] },
            { description: 'Ask about menu items', keywords: ['what', 'menu', 'dish', 'recommend'] },
            { description: 'Place food order', keywords: ['order', 'have', 'like', 'please'] },
        ],
        estimatedDuration: 4,
    },
    {
        title: 'Business Meeting - Project Discussion',
        description: 'Participate in a business meeting to discuss project progress and next steps.',
        difficulty: 'advanced',
        category: 'business',
        language: 'en-US',
        systemPrompt: 'You are a project manager leading a team meeting. Discuss project status, challenges, and next steps. Be professional and encourage participation. Keep responses focused (2-3 sentences).',
        initialMessage: 'Good morning everyone. Let\'s start by reviewing our progress on the current project. How are things going on your end?',
        expectedTopics: ['progress', 'challenges', 'timeline', 'resources', 'next steps'],
        suggestedVocabulary: [
            { word: 'milestone', definition: 'Significant stage', example: 'We reached an important milestone.' },
            { word: 'deadline', definition: 'Time limit', example: 'The deadline is next Friday.' },
            { word: 'stakeholder', definition: 'Interested party', example: 'We need stakeholder approval.' },
        ],
        objectives: [
            { description: 'Report progress', keywords: ['progress', 'completed', 'finished', 'done'] },
            { description: 'Discuss challenges', keywords: ['challenge', 'issue', 'problem', 'difficulty'] },
            { description: 'Propose solutions', keywords: ['suggest', 'propose', 'solution', 'plan'] },
        ],
        estimatedDuration: 7,
    },
    {
        title: 'Casual Conversation - Making Friends',
        description: 'Practice casual conversation to make new friends. Discuss hobbies, interests, and plans.',
        difficulty: 'beginner',
        category: 'casual',
        language: 'en-US',
        systemPrompt: 'You are a friendly person meeting someone new. Have a casual conversation about hobbies, interests, and daily life. Be warm and engaging. Keep responses natural and brief (1-2 sentences).',
        initialMessage: 'Hi there! I don\'t think we\'ve met before. I\'m Alex. What brings you here today?',
        expectedTopics: ['hobbies', 'interests', 'work', 'weekend plans', 'movies', 'music'],
        suggestedVocabulary: [
            { word: 'hobby', definition: 'Leisure activity', example: 'My hobby is photography.' },
            { word: 'passionate', definition: 'Very enthusiastic', example: 'I\'m passionate about music.' },
            { word: 'lately', definition: 'Recently', example: 'What have you been up to lately?' },
        ],
        objectives: [
            { description: 'Introduce yourself', keywords: ['name', 'I\'m', 'my name'] },
            { description: 'Discuss hobbies', keywords: ['hobby', 'like', 'enjoy', 'love'] },
            { description: 'Make plans', keywords: ['weekend', 'plans', 'meet', 'hang out'] },
        ],
        estimatedDuration: 5,
    },
];

async function seedScenarios() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing scenarios
        await RoleplayScenario.deleteMany({});
        console.log('🗑️  Cleared existing scenarios');

        // Insert new scenarios
        await RoleplayScenario.insertMany(scenarios);
        console.log(`✅ Inserted ${scenarios.length} roleplay scenarios`);

        console.log('\nScenarios created:');
        scenarios.forEach((s, i) => {
            console.log(`${i + 1}. ${s.title} (${s.difficulty} - ${s.category})`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding scenarios:', error);
        process.exit(1);
    }
}

seedScenarios();
