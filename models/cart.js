// models/cart.js - FIXED VERSION with consistent field names
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
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
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
        validate: {
          validator: function(v) {
            return Number.isInteger(v) && v > 0;
          },
          message: 'Quantity must be a positive integer'
        }
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cartSchema.index({ user: 1, 'items.rawMaterial': 1 });

cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

cartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const uniqueItems = new Map();
    
    this.items.forEach(item => {
      const rawMaterialId = item.rawMaterial.toString();
      if (uniqueItems.has(rawMaterialId)) {
        const existingItem = uniqueItems.get(rawMaterialId);
        existingItem.quantity += item.quantity;
      } else {
        uniqueItems.set(rawMaterialId, item);
      }
    });
    
    this.items = Array.from(uniqueItems.values());
  }
  next();
});

cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('uniqueItemsCount').get(function() {
  return this.items.length;
});

cartSchema.methods.addItem = function(rawMaterialId, quantity = 1) {
  const existingItemIndex = this.items.findIndex(item => 
    item.rawMaterial.toString() === rawMaterialId.toString()
  );
  
  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      rawMaterial: rawMaterialId,
      quantity
    });
  }
  
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(rawMaterialId, quantity) {
  const itemIndex = this.items.findIndex(item => 
    item.rawMaterial.toString() === rawMaterialId.toString()
  );
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

cartSchema.methods.removeItem = function(rawMaterialId) {
  this.items = this.items.filter(item => 
    item.rawMaterial.toString() !== rawMaterialId.toString()
  );
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({
      user: userId,
      items: []
    });
    await cart.save();
  }
  
  return cart;
};

cartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;