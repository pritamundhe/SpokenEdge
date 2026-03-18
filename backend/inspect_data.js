import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const inspectData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the user by the email seen in the screenshot
        const email = 'pritammundhe00@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User Data found in DB:');
            console.log('ID:', user._id);
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('ProfileImage:', `"${user.profileImage}"`);
            console.log('PreferredLanguage:', user.preferredLanguage);
        } else {
            console.log(`User ${email} not found.`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error inspecting user:', error);
        process.exit(1);
    }
};

inspectData();
