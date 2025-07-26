// /api/rawmaterials/[id]/reviews/route.js
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    console.log('POST Review - Raw Material ID:', (await params).id); // Debug log
    await connectDB();
    
    // Await params before using its properties
    const { id } = await params;
    
    // Get user ID from cookie (same way as auth/user API)
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    console.log('POST Review - User ID from cookie:', userId); // Debug log
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please login to write a review' },
        { status: 401 }
      );
    }

    const { rating, title, comment } = await request.json();
    console.log('POST Review - Data received:', { rating, title, comment }); // Debug log

    // Validation
    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please login again.' },
        { status: 401 }
      );
    }

    // Find the raw material
    const rawMaterial = await RawMaterial.findById(id).populate('createdBy');
    
    if (!rawMaterial) {
      return NextResponse.json(
        { success: false, error: 'Raw material not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this material
    const existingReview = await Review.findOne({
      userId: user._id,
      rawMaterialId: id,
      isActive: true
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this raw material. You can edit your existing review.' },
        { status: 400 }
      );
    }

    // Create new review
    const newReview = new Review({
      userId: user._id,
      userName: user.vendorName, // Use vendorName from user model
      rawMaterialId: id,
      rawMaterialName: rawMaterial.name,
      supplierId: rawMaterial.createdBy._id,
      supplierName: rawMaterial.createdBy.supplierName,
      rating: parseInt(rating),
      title: title ? title.trim() : '',
      comment: comment.trim()
    });

    console.log('POST Review - About to save new review'); // Debug log
    try {
      await newReview.save();
      console.log('POST Review - New review saved successfully:', newReview._id); // Debug log
    } catch (saveError) {
      console.error('POST Review - Save error:', saveError); // Debug log
      
      // Handle duplicate key error specifically
      if (saveError.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product. Please refresh the page.' },
          { status: 400 }
        );
      }
      
      throw saveError; // Re-throw other errors
    }

    // Update raw material ratings
    const allReviews = await Review.find({ 
      rawMaterialId: params.id, 
      isActive: true 
    });
    console.log('POST Review - All active reviews found:', allReviews.length); // Debug log
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / allReviews.length;
    
    await RawMaterial.findByIdAndUpdate(params.id, {
      ratings: avgRating,
      numReviews: allReviews.length
    });

    return NextResponse.json({
      success: true,
      review: {
        _id: newReview._id,
        userName: newReview.userName,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        createdAt: newReview.createdAt,
        userId: newReview.userId,
        userProfilePicture: user.profilePicture
      },
      message: 'Review added successfully'
    });

  } catch (error) {
    console.error('Add review error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You have already reviewed this raw material'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    // Await params before using its properties
    const { id } = await params;
    console.log('GET Reviews - Raw Material ID:', id); // Debug log
    await connectDB();
    
    // Get reviews from Review collection
    const reviews = await Review.find({ 
      rawMaterialId: id, 
      isActive: true 
    })
    .populate('userId', 'vendorName email profilePicture')
    .sort({ createdAt: -1 })
    .lean();

    console.log('GET Reviews - Found reviews:', reviews.length); // Debug log

    if (!reviews) {
      return NextResponse.json({
        success: true,
        reviews: [],
        total: 0
      });
    }

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      userId: review.userId?._id || review.userId,
      supplierName: review.supplierName,
      userProfilePicture: review.userId?.profilePicture || null
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      total: formattedReviews.length
    });

  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reviews',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update review (only by the user who created it)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please login to update review' },
        { status: 401 }
      );
    }

    const { reviewId, rating, title, comment } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Get user details for profile picture
    const user = await User.findById(userId);

    // Update review
    if (rating) review.rating = parseInt(rating);
    if (title !== undefined) review.title = title.trim();
    if (comment) review.comment = comment.trim();

    await review.save();

    // Update raw material ratings
    const allReviews = await Review.find({ 
      rawMaterialId: params.id, 
      isActive: true 
    });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / allReviews.length;
    
    await RawMaterial.findByIdAndUpdate(params.id, {
      ratings: avgRating,
      numReviews: allReviews.length
    });

    return NextResponse.json({
      success: true,
      review: {
        _id: review._id,
        userName: review.userName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        userId: review.userId,
        userProfilePicture: user?.profilePicture || null
      },
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete review (only by the user who created it)
export async function DELETE(request, { params }) {
  try {
    console.log('DELETE Review - Starting delete process'); // Debug log
    await connectDB();
    
    // Await params before using its properties
    const { id } = await params;
    
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    console.log('DELETE Review - User ID:', userId); // Debug log
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please login to delete review' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const reviewId = url.searchParams.get('reviewId');
    console.log('DELETE Review - Review ID:', reviewId); // Debug log

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    console.log('DELETE Review - Found review:', review ? 'Yes' : 'No'); // Debug log
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      console.log('DELETE Review - User mismatch:', review.userId.toString(), 'vs', userId); // Debug log
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Soft delete - mark as inactive
    console.log('DELETE Review - Before soft delete, isActive:', review.isActive); // Debug log
    review.isActive = false;
    await review.save();
    console.log('DELETE Review - After soft delete, isActive:', review.isActive); // Debug log

    // Update raw material ratings
    const allReviews = await Review.find({ 
      rawMaterialId: id, 
      isActive: true 
    });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
    
    await RawMaterial.findByIdAndUpdate(id, {
      ratings: avgRating,
      numReviews: allReviews.length
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}