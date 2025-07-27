// app/api/ai/recommend/route.js - AI Recommendation API
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import User from '@/models/user';
import { AIRecommendationEngine } from '@/lib/aiRecommendation';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get user authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to use AI recommendations' },
        { status: 401 }
      );
    }

    // Get user input
    const { query } = await request.json();
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide raw material names' },
        { status: 400 }
      );
    }

    console.log('AI Recommendation request:', { userId, query });

    // Get user location info
    const user = await User.findById(userId).select('stallAddress');
    const userLocation = user?.stallAddress || '';

    // Get all available raw materials with supplier details
    const allRawMaterials = await RawMaterial.find({ 
      isActive: true,
      quantity: { $gt: 0 } // Only materials in stock
    })
    .populate({
      path: 'createdBy',
      select: 'supplierName businessAddress businessType'
    })
    .lean();

    console.log(`Found ${allRawMaterials.length} available materials`);

    if (allRawMaterials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No raw materials available at the moment',
        recommendations: []
      });
    }

    // Get AI recommendations
    const result = await AIRecommendationEngine.getRecommendations(
      query,
      userLocation,
      allRawMaterials
    );

    console.log('AI Recommendations result:', result);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate recommendations',
        recommendations: []
      }, { status: 500 });
    }

    // Filter out empty recommendations
    const validRecommendations = result.recommendations.filter(
      rec => rec.recommendedMaterial
    );

    return NextResponse.json({
      success: true,
      query: query,
      totalFound: validRecommendations.length,
      recommendations: validRecommendations,
      message: validRecommendations.length > 0 
        ? `Found ${validRecommendations.length} recommendations for "${query}"` 
        : `No matches found for "${query}". Try different keywords.`
    });

  } catch (error) {
    console.error('AI Recommendation API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process AI recommendation request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}