// /api/rawmaterials/[id]/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Supplier from '@/models/supplier';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Await params before using its properties
    const { id } = await params;
    
    // Fetch raw material with supplier data populated
    const rawMaterial = await RawMaterial.findById(id)
      .populate({
        path: 'createdBy',
        model: Supplier,
        select: 'supplierName email phone businessAddress businessType websiteUrl establishedYear description'
      })
      .lean();

    if (!rawMaterial) {
      return NextResponse.json(
        { success: false, error: 'Raw material not found' },
        { status: 404 }
      );
    }

    // Calculate discount percentage if originalPrice exists
    let discount = 0;
    if (rawMaterial.originalPrice && rawMaterial.originalPrice > rawMaterial.price) {
      discount = Math.round(((rawMaterial.originalPrice - rawMaterial.price) / rawMaterial.originalPrice) * 100);
    }

    // Initialize rating data from the model fields
    let ratings = rawMaterial.ratings || 0;
    let numReviews = rawMaterial.numReviews || 0;

    // Process the raw material data
    const processedMaterial = {
      ...rawMaterial,
      discount,
      ratings: parseFloat(ratings.toFixed(1)),
      numReviews,
      // Format features as array if it's a string
      features: typeof rawMaterial.features === 'string' ? 
        rawMaterial.features.split(',').map(f => f.trim()).filter(f => f) : 
        rawMaterial.features || [],
      // Format tags as array if it's a string
      tags: typeof rawMaterial.tags === 'string' ? 
        rawMaterial.tags.split(',').map(t => t.trim()).filter(t => t) : 
        rawMaterial.tags || [],
      // Sort reviews by date (newest first)
      reviews: (rawMaterial.reviews || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };

    return NextResponse.json({
      success: true,
      rawMaterial: processedMaterial
    });

  } catch (error) {
    console.error('Fetch raw material error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch raw material',
        details: error.message 
      },
      { status: 500 }
    );
  }
}