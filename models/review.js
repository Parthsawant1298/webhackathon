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
    required: true,
    trim: true
  },
  
  // Raw material being reviewed
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  rawMaterialName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Supplier of the raw material
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  
  // Helpful votes (for future use)
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Helpful votes cannot be negative']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Drop existing index if it exists and create new one
reviewSchema.index({ userId: 1, rawMaterialId: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true },
  name: 'unique_active_user_material_review'
});

// Additional indexes for efficient queries
reviewSchema.index({ rawMaterialId: 1, isActive: 1 });
reviewSchema.index({ supplierId: 1, isActive: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware for validation
reviewSchema.pre('save', function(next) {
  // Ensure rating is an integer
  this.rating = Math.round(this.rating);
  
  // Ensure rating is within bounds
  if (this.rating < 1) this.rating = 1;
  if (this.rating > 5) this.rating = 5;
  
  next();
});

// Static method to get average rating for a raw material
reviewSchema.statics.getAverageRating = async function(rawMaterialId) {
  const result = await this.aggregate([
    {
      $match: {
        rawMaterialId: new mongoose.Types.ObjectId(rawMaterialId),
        isActive: true
      }
    },
    {
      $group: {
        _id: '$rawMaterialId',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    return {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      numReviews: result[0].numReviews
    };
  }

  return { averageRating: 0, numReviews: 0 };
};

// Instance method to check if user can edit this review
reviewSchema.methods.canEdit = function(userId) {
  return this.userId.toString() === userId.toString() && this.isActive;
};

// Transform output to remove sensitive data
reviewSchema.methods.toJSON = function() {
  const review = this.toObject();
  return review;
};

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;