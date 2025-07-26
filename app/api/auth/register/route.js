// app/api/auth/register/route.js
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await connectDB();

        const { vendorName, email, password, phone, stallAddress } = await request.json();

        // Validate input
        if (!vendorName || !email || !password || !phone || !stallAddress) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create new vendor
        const user = await User.create({
            vendorName,
            email,
            password,
            phone,
            stallAddress,
            lastLogin: new Date()
        });

        // Return response without password
        const userData = {
            id: user._id,
            name: user.vendorName, // Map vendorName to name for frontend consistency
            vendorName: user.vendorName,
            email: user.email,
            phone: user.phone,
            stallAddress: user.stallAddress
        };

        return NextResponse.json({
            success: true,
            message: 'Vendor registration successful',
            user: userData
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}