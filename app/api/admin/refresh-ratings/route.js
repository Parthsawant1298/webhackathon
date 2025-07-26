// /api/admin/refresh-ratings/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Review from '@/models/review';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all raw materials
    const rawMaterials = await RawMaterial.find({ isActive: true });
    console.log(`Found ${rawMaterials.length} raw materials to update`);

    let updated = 0;
    let skipped = 0;
    const results = [];

    for (const material of rawMaterials) {
      try {
        // Get all active reviews for this raw material
        const reviews = await Review.find({ 
          rawMaterialId: material._id, 
          isActive: true 
        });
        
        let avgRating = 0;
        const numReviews = reviews.length;
        
        if (numReviews > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          avgRating = Math.round((totalRating / numReviews) * 10) / 10; // Round to 1 decimal
        }
        
        // Update the raw material
        await RawMaterial.findByIdAndUpdate(material._id, {
          ratings: avgRating,
          numReviews: numReviews
        });
        
        results.push({
          name: material.name,
          oldRatings: material.ratings,
          newRatings: avgRating,
          oldNumReviews: material.numReviews,
          newNumReviews: numReviews
        });
        
        console.log(`Updated ${material.name}: ${avgRating} stars (${numReviews} reviews)`);
        updated++;
        
      } catch (error) {
        console.error(`Error updating ${material.name}:`, error.message);
        results.push({
          name: material.name,
          error: error.message
        });
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Update complete! Successfully updated: ${updated} materials, Skipped: ${skipped} materials`,
      results: results,
      summary: {
        total: rawMaterials.length,
        updated: updated,
        skipped: skipped
      }
    });

  } catch (error) {
    console.error('Error updating raw material ratings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ratings', details: error.message },
      { status: 500 }
    );
  }
}
