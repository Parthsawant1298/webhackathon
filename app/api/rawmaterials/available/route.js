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

    // Update ratings for all materials and process them
    const processedMaterials = await Promise.all(rawMaterials.map(async (material) => {
      // Get current reviews for this material
      const allReviews = await Review.find({ 
        rawMaterialId: material._id, 
        isActive: true 
      });

      let currentRatings = 0;
      let currentNumReviews = allReviews.length;

      if (currentNumReviews > 0) {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        currentRatings = totalRating / currentNumReviews;
      }

      // Update the raw material in database if ratings don't match
      if (material.ratings !== currentRatings || material.numReviews !== currentNumReviews) {
        await RawMaterial.findByIdAndUpdate(material._id, {
          ratings: currentRatings,
          numReviews: currentNumReviews
        });
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

      console.log(`Material ${material.name}: updated ratings=${currentRatings}, numReviews=${currentNumReviews}`);

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
    }));

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