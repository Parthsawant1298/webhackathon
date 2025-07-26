import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Raw material name is required'],
    trim: true,
    maxlength: [100, 'Raw material name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true,
    maxlength: [50, 'Subcategory cannot be more than 50 characters']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature cannot be more than 100 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  mainImage: {
    type: String,
    required: [true, 'Main image is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  reviews: [{
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'User name cannot be more than 50 characters']
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot be more than 100 characters']
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search optimization
rawMaterialSchema.index({ name: 'text', description: 'text', category: 'text', subcategory: 'text' });
rawMaterialSchema.index({ category: 1, subcategory: 1 });
rawMaterialSchema.index({ createdBy: 1 });
rawMaterialSchema.index({ createdAt: -1 });

const RawMaterial = mongoose.models.RawMaterial || mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;
