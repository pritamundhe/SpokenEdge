import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getUserIdFromToken() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null; // No token found - changed from throwing to returning null for safe handling

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        return decoded.userId;
    } catch (error) {
        return null; // Invalid token
    }
}

export async function GET(req) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, profileImage } = await req.json();

        await connectToDatabase();

        // If profileImage is a base64 string, upload it to Cloudinary
        let imageUrl = '';
        if (profileImage && profileImage.startsWith('data:image')) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(profileImage, {
                    folder: 'nextjs_profiles',
                });
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary Upload Error:', uploadError);
                return NextResponse.json({ message: 'Image upload failed' }, { status: 500 });
            }
        }

        const updateData = { name };
        if (imageUrl) {
            updateData.profileImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        return NextResponse.json({ message: 'Profile updated', user }, { status: 200 });
    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
