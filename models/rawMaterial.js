// models/rawMaterial.js - FIXED VERSION
import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Raw material name is required'],
    trim: true,
    maxlength: [100, 'Raw material name cannot be more than 100 characters'],
    index: true
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
    min: [0, 'Price cannot be negative'],
    index: true
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
    min: [0, 'Quantity must be at least 0'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters'],
    index: true
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true,
    maxlength: [50, 'Subcategory cannot be more than 50 characters'],
    index: true
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
    required: true,
    index: true
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5'],
    index: true
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
rawMaterialSchema.index({ category: 1, subcategory: 1, isActive: 1 });
rawMaterialSchema.index({ createdBy: 1, isActive: 1 });
rawMaterialSchema.index({ createdAt: -1 });
rawMaterialSchema.index({ ratings: -1, numReviews: -1 });
rawMaterialSchema.index({ price: 1 });
rawMaterialSchema.index({ quantity: 1 });

// Text index for search
rawMaterialSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text', 
  subcategory: 'text' 
});

// Virtual for checking if material is in stock
rawMaterialSchema.virtual('inStock').get(function() {
  return this.quantity > 0;
});

// Virtual for checking if material has low stock
rawMaterialSchema.virtual('lowStock').get(function() {
  return this.quantity > 0 && this.quantity <= 5;
});

// Pre-save middleware to calculate discount
rawMaterialSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

// Static method to find available materials by supplier
rawMaterialSchema.statics.findAvailableBySupplier = function(supplierId) {
  return this.find({ 
    createdBy: supplierId, 
    isActive: true,
    quantity: { $gt: 0 }
  });
};

// Instance method to check if material is available in requested quantity
rawMaterialSchema.methods.isAvailable = function(requestedQuantity) {
  return this.isActive && this.quantity >= requestedQuantity;
};

// Transform for JSON output
rawMaterialSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const RawMaterial = mongoose.models.RawMaterial || mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;