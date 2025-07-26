// models/rawMaterial.js - CLEANED VERSION (Remove unused rating logic)
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
    min: [0, 'Quantity must be at least 0']
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
  // ✅ KEEP: These fields store aggregated review data for performance
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

// ✅ KEEP: Essential indexes for search optimization
rawMaterialSchema.index({ name: 'text', description: 'text', category: 'text', subcategory: 'text' });
rawMaterialSchema.index({ category: 1, subcategory: 1 });
rawMaterialSchema.index({ createdBy: 1 });
rawMaterialSchema.index({ createdAt: -1 });
rawMaterialSchema.index({ ratings: -1 }); // Index for sorting by ratings
rawMaterialSchema.index({ numReviews: -1 }); // Index for sorting by review count
const RawMaterial = mongoose.models.RawMaterial || mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;