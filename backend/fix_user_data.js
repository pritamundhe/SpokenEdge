import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixUserData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'pritammundhe00@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found user: ${user.email}`);

            // Fix Name
            if (!user.name || user.name === 'undefined') {
                user.name = 'Pritam Mundhe';
                console.log('-> Setting Name to "Pritam Mundhe"');
            }

            // Fix Profile Image (using a placeholder)
            if (!user.profileImage) {
                user.profileImage = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pritam';
                console.log('-> Setting Profile Image to placeholder');
            }

            await user.save();
            console.log('User updated successfully!');
        } else {
            console.log(`User ${email} not found.`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
};

fixUserData();
