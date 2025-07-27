// /api/rawmaterials/available/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Review from '@/models/review';
import Supplier from '@/models/supplier';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all raw materials with supplier data populated, only in stock
    const rawMaterials = await RawMaterial.find({ 
      quantity: { $gt: 0 }, // Only materials in stock
      isActive: true // Only active materials
    })
      .populate({
        path: 'createdBy',
        model: Supplier,
        select: 'supplierName email phone businessAddress businessType websiteUrl establishedYear description'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get all material IDs for batch review query
    const materialIds = rawMaterials.map(material => material._id);

    // Batch fetch all reviews for all materials
    const allReviews = await Review.find({ 
      rawMaterialId: { $in: materialIds }, 
      isActive: true 
    }).lean();

    // Create a map of material ID to reviews for efficient lookup
    const reviewsMap = new Map();
    allReviews.forEach(review => {
      const materialId = review.rawMaterialId.toString();
      if (!reviewsMap.has(materialId)) {
        reviewsMap.set(materialId, []);
      }
      reviewsMap.get(materialId).push(review);
    });

    // Process materials with reviews data
    const processedMaterials = rawMaterials.map((material) => {
      const materialReviews = reviewsMap.get(material._id.toString()) || [];
      
      let currentRatings = 0;
      let currentNumReviews = materialReviews.length;

      if (currentNumReviews > 0) {
        const totalRating = materialReviews.reduce((sum, review) => sum + review.rating, 0);
        currentRatings = totalRating / currentNumReviews;
      }

      // Calculate discount percentage if originalPrice exists
      let discount = 0;
      if (material.originalPrice && material.originalPrice > material.price) {
        discount = Math.round(((material.originalPrice - material.price) / material.originalPrice) * 100);
      }

      // Get main image (first image if multiple exist)
      let mainImage = null;
      if (material.images && material.images.length > 0) {
        // Handle both old format (direct URL) and new format (object with url property)
        mainImage = typeof material.images[0] === 'string' ? material.images[0] : material.images[0].url;
      }

      return {
        ...material,
        discount,
        mainImage,
        ratings: parseFloat(currentRatings.toFixed(1)),
        numReviews: currentNumReviews,
        // Format features as array if it's a string
        features: typeof material.features === 'string' ? 
          material.features.split(',').map(f => f.trim()).filter(f => f) : 
          material.features || [],
        // Format tags as array if it's a string
        tags: typeof material.tags === 'string' ? 
          material.tags.split(',').map(t => t.trim()).filter(t => t) : 
          material.tags || []
      };
    });

    return NextResponse.json({
      success: true,
      rawMaterials: processedMaterials,
      total: processedMaterials.length
    });

  } catch (error) {
    console.error('Fetch raw materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch raw materials', details: error.message },
      { status: 500 }
    );
  }
}