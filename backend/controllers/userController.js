import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        let profileImage = '';

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'mern_profiles',
            });
            profileImage = result.secure_url;
            // Remove file from local uploads after uploading to Cloudinary
            fs.unlinkSync(req.file.path);
        }

        const updateData = { name };
        if (profileImage) {
            updateData.profileImage = profileImage;
        }

        const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-password');

        res.status(200).json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.userId } }, // Exclude current user
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        }).select('name email profileImage preferredLanguage');

        res.status(200).json(users);
    } catch (error) {
        console.error('Search Users Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email profileImage preferredLanguage nativeLanguage learningGoals createdAt');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
