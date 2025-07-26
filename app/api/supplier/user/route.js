// app/api/supplier/user/route.js
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/supplier';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Simple in-memory cache for supplier data
const supplierCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Cache cleanup to prevent memory bloat
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of supplierCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            supplierCache.delete(key);
        }
    }
}, 60000); // Clean every minute

export async function GET() {
    try {
        // Get supplier session from cookie
        const cookieStore = await cookies();
        const supplierSession = cookieStore.get('supplier-session')?.value;

        if (!supplierSession) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const sessionData = JSON.parse(supplierSession);
        const supplierId = sessionData.id;

        // Check cache first
        const cacheKey = `supplier_${supplierId}`;
        const cachedData = supplierCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            return NextResponse.json({
                success: true,
                supplier: cachedData.supplier
            });
        }

        await connectDB();

        // Find supplier by ID - optimized query
        const supplier = await Supplier.findById(supplierId)
            .select('_id supplierName email phone businessAddress businessType supplierID profilePicture createdAt')
            .lean()
            .exec();

        if (!supplier) {
            return NextResponse.json(
                { error: 'Supplier not found' },
                { status: 404 }
            );
        }

        // Return supplier data
        const supplierData = {
            id: supplier._id,
            name: supplier.supplierName, // Map supplierName to name for frontend consistency
            supplierName: supplier.supplierName,
            email: supplier.email,
            phone: supplier.phone,
            businessAddress: supplier.businessAddress,
            businessType: supplier.businessType,
            supplierID: supplier.supplierID,
            profilePicture: supplier.profilePicture,
            createdAt: supplier.createdAt
        };

        // Cache the supplier data for next requests
        supplierCache.set(cacheKey, {
            supplier: supplierData,
            timestamp: Date.now()
        });

        return NextResponse.json({
            success: true,
            supplier: supplierData
        });

    } catch (error) {
        console.error('Get supplier error:', error);
        return NextResponse.json(
            { error: 'Failed to get supplier data' },
            { status: 500 }
        );
    }
}
