// app/api/auth/login/route.js
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await connectDB();
        
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Find user and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login time
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Set secure cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: user._id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'strict'
        });

        // Create session data (without sensitive info)
        const userData = {
            id: user._id,
            name: user.vendorName, // Map vendorName to name for frontend consistency
            vendorName: user.vendorName,
            email: user.email,
            phone: user.phone,
            stallAddress: user.stallAddress,
            profilePicture: user.profilePicture
        };

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}