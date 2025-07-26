// /api/rawmaterials/[id]/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Review from '@/models/review';
import Supplier from '@/models/supplier';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
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

    // Get updated ratings from Review collection
    const allReviews = await Review.find({ 
      rawMaterialId: id, 
      isActive: true 
    });

    let currentRatings = 0;
    let currentNumReviews = allReviews.length;

    if (currentNumReviews > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      currentRatings = totalRating / currentNumReviews;
    }

    // Update the raw material in database if ratings don't match
    if (rawMaterial.ratings !== currentRatings || rawMaterial.numReviews !== currentNumReviews) {
      await RawMaterial.findByIdAndUpdate(id, {
        ratings: currentRatings,
        numReviews: currentNumReviews
      });
      
      // Update our local object
      rawMaterial.ratings = currentRatings;
      rawMaterial.numReviews = currentNumReviews;
    }

    // Calculate discount percentage if originalPrice exists
    let discount = 0;
    if (rawMaterial.originalPrice && rawMaterial.originalPrice > rawMaterial.price) {
      discount = Math.round(((rawMaterial.originalPrice - rawMaterial.price) / rawMaterial.originalPrice) * 100);
    }

    // Process the raw material data
    const processedMaterial = {
      ...rawMaterial,
      discount,
      ratings: parseFloat(currentRatings.toFixed(1)),
      numReviews: currentNumReviews,
      // Format features as array if it's a string
      features: typeof rawMaterial.features === 'string' ? 
        rawMaterial.features.split(',').map(f => f.trim()).filter(f => f) : 
        rawMaterial.features || [],
      // Format tags as array if it's a string
      tags: typeof rawMaterial.tags === 'string' ? 
        rawMaterial.tags.split(',').map(t => t.trim()).filter(t => t) : 
        rawMaterial.tags || []
    };

    console.log(`Material ${id} - Updated ratings: ${currentRatings}, numReviews: ${currentNumReviews}`);

    return NextResponse.json({
      success: true,
      rawMaterial: processedMaterial
    });

  } catch (error) {
    console.error('Fetch raw material error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch raw material', details: error.message },
      { status: 500 }
    );
  }
}