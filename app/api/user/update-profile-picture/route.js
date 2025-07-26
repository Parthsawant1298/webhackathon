// app/api/user/update-profile-picture/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('profileImage');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size should not exceed 5MB' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'supplymind/profile-pictures',
                    public_id: `vendor_${userId}_${Date.now()}`,
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        // Delete old profile picture from Cloudinary if exists
        if (user.profilePicture) {
            try {
                // Extract public_id from the old URL
                const urlParts = user.profilePicture.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = publicIdWithExtension.split('.')[0];
                const fullPublicId = `supplymind/profile-pictures/${publicId}`;
                
                await cloudinary.uploader.destroy(fullPublicId);
            } catch (deleteError) {
                console.warn('Failed to delete old profile picture:', deleteError);
                // Continue anyway, don't fail the upload
            }
        }

        // Update user profile picture in database
        user.profilePicture = uploadResponse.secure_url;
        await user.save({ validateBeforeSave: false });

        return NextResponse.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: uploadResponse.secure_url
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to upload profile picture',
                details: error.message 
            },
            { status: 500 }
        );
    }
}