// app/api/auth/user/route.js
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Simple in-memory cache for user data
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Cache cleanup to prevent memory bloat
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            userCache.delete(key);
        }
    }
}, 60000); // Clean every minute

export async function GET() {
    try {
        // Get user ID from cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check cache first
        const cacheKey = `user_${userId}`;
        const cachedData = userCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            return NextResponse.json({
                success: true,
                user: cachedData.user
            });
        }

        await connectDB();

        // Find user by ID - optimized query
        const user = await User.findById(userId)
            .select('_id vendorName email phone stallAddress profilePicture createdAt')
            .lean()
            .exec();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data
        const userData = {
            id: user._id,
            name: user.vendorName, // Map vendorName to name for frontend consistency
            vendorName: user.vendorName,
            email: user.email,
            phone: user.phone,
            stallAddress: user.stallAddress,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt
        };

        // Cache the user data for next requests
        userCache.set(cacheKey, {
            user: userData,
            timestamp: Date.now()
        });

        return NextResponse.json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user data' },
            { status: 500 }
        );
    }
}