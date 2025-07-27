const mongoose = require('mongoose');

const SurplusSchema = new mongoose.Schema({
  rawMaterialName: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Sold'], default: 'Pending' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.models.Surplus || mongoose.model('Surplus', SurplusSchema); 