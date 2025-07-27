// models/order.js - FIXED VERSION
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [
    {
      rawMaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial',
        required: true,
        index: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
    index: true
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: {
      values: ['processing', 'delivered', 'payment failed'],
      message: 'Status must be either processing, delivered, or payment failed'
    },
    default: 'payment failed',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: 'Payment status must be pending, completed, failed, or refunded'
    },
    default: 'pending',
    index: true
  },
  paymentInfo: {
    razorpayOrderId: {
      type: String,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      index: true
    },
    razorpaySignature: String
  },
  processedAt: Date,
  deliveredAt: Date,
  failedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Compound indexes for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.razorpayOrderId': 1 });
orderSchema.index({ 'items.rawMaterial': 1 });
orderSchema.index({ totalAmount: -1 });

// Index for supplier analytics
orderSchema.index({ 'items.rawMaterial': 1, paymentStatus: 1, createdAt: -1 });

// Virtual for order value category
orderSchema.virtual('valueCategory').get(function() {
  if (this.totalAmount < 500) return 'low';
  if (this.totalAmount < 2500) return 'medium';
  if (this.totalAmount < 10000) return 'high';
  return 'premium';
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to update timestamps based on status
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        break;
      case 'payment failed':
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  next();
});

// Static method to get orders by supplier
orderSchema.statics.findBySupplier = function(supplierRawMaterialIds, options = {}) {
  const query = this.find({ 'items.rawMaterial': { $in: supplierRawMaterialIds } });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.paymentStatus) {
    query.where('paymentStatus', options.paymentStatus);
  }
  
  if (options.startDate || options.endDate) {
    const dateFilter = {};
    if (options.startDate) dateFilter.$gte = new Date(options.startDate);
    if (options.endDate) dateFilter.$lte = new Date(options.endDate);
    query.where('createdAt', dateFilter);
  }
  
  return query.sort({ createdAt: -1 });
};

// Static method to get revenue by supplier
orderSchema.statics.getSupplierRevenue = function(supplierRawMaterialIds, options = {}) {
  const pipeline = [
    { 
      $match: { 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        paymentStatus: 'completed'
      } 
    },
    { $unwind: '$items' },
    { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalOrders: { $addToSet: '$_id' },
        totalItems: { $sum: '$items.quantity' }
      }
    },
    {
      $project: {
        totalRevenue: 1,
        totalOrders: { $size: '$totalOrders' },
        totalItems: 1,
        averageOrderValue: { $divide: ['$totalRevenue', { $size: '$totalOrders' }] }
      }
    }
  ];
  
  if (options.startDate || options.endDate) {
    const dateFilter = {};
    if (options.startDate) dateFilter.$gte = new Date(options.startDate);
    if (options.endDate) dateFilter.$lte = new Date(options.endDate);
    pipeline[0].$match.createdAt = dateFilter;
  }
  
  return this.aggregate(pipeline);
};

// Instance method to check if order contains supplier's materials
orderSchema.methods.containsSupplierMaterials = function(supplierRawMaterialIds) {
  return this.items.some(item => 
    supplierRawMaterialIds.some(id => id.toString() === item.rawMaterial.toString())
  );
};

// Instance method to get supplier-specific items and revenue
orderSchema.methods.getSupplierPortition = function(supplierRawMaterialIds) {
  const supplierItems = this.items.filter(item =>
    supplierRawMaterialIds.some(id => id.toString() === item.rawMaterial.toString())
  );
  
  const supplierRevenue = supplierItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
  
  return {
    items: supplierItems,
    revenue: supplierRevenue,
    itemCount: supplierItems.reduce((total, item) => total + item.quantity, 0)
  };
};

// Transform for JSON output
orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;