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
