// /api/rawmaterials/available/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
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

    // Calculate some helpful fields
    const processedMaterials = rawMaterials.map(material => {
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

      // Initialize rating data from the model fields
      let ratings = material.ratings || 0;
      let numReviews = material.numReviews || 0;
      
      console.log(`Material ${material.name}: ratings=${ratings}, numReviews=${numReviews}`); // Debug log

      return {
        ...material,
        discount,
        mainImage,
        ratings: parseFloat(ratings.toFixed(1)),
        numReviews,
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
      { 
        success: false,
        error: 'Failed to fetch raw materials',
        details: error.message 
      },
      { status: 500 }
    );
  }
}