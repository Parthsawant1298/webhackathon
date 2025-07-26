import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // User who wrote the review
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Raw material being reviewed
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  rawMaterialName: {
    type: String,
    required: true
  },
  
  // Supplier of the raw material
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Helpful votes (for future use)
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate active reviews from same user for same product
// Only active reviews should be unique per user per product
reviewSchema.index({ userId: 1, rawMaterialId: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});

// Index for efficient queries
reviewSchema.index({ rawMaterialId: 1, isActive: 1 });
reviewSchema.index({ supplierId: 1, isActive: 1 });
reviewSchema.index({ userId: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
