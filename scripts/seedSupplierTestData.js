// scripts/seedSupplierTestData.js

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const RawMaterial = require('../models/rawMaterial').default || require('../models/rawMaterial');
const Order = require('../models/order').default || require('../models/order');
const Supplier = require('../models/supplier').default || require('../models/supplier');
const User = require('../models/user').default || require('../models/user');
const connectDB = require('../lib/mongodb').default || require('../lib/mongodb');

const SUPPLIER_ID = '68849c419d4d468824bae3c1';

async function seed() {
  await connectDB();
  console.log('Connected to DB');

  // Find supplier
  const supplier = await Supplier.findById(SUPPLIER_ID);
  if (!supplier) {
    console.error('Supplier not found!');
    process.exit(1);
  }
  console.log('Supplier found:', supplier.supplierName);

  // Find or create a raw material
  let rawMaterial = await RawMaterial.findOne({ createdBy: SUPPLIER_ID, isActive: true });
  if (!rawMaterial) {
    rawMaterial = await RawMaterial.create({
      name: 'Demo Material',
      description: 'Material for dashboard test',
      price: 100,
      quantity: 10,
      category: 'Test',
      mainImage: 'https://via.placeholder.com/150',
      createdBy: SUPPLIER_ID,
      isActive: true
    });
    console.log('Created raw material:', rawMaterial._id);
  } else {
    console.log('Raw material already exists:', rawMaterial._id);
  }

  // Find any user
  const user = await User.findOne();
  if (!user) {
    console.error('No user found! Please register a user first.');
    process.exit(1);
  }
  console.log('User found:', user._id);

  // Check if a test order already exists
  let order = await Order.findOne({ 'items.rawMaterial': rawMaterial._id, user: user._id });
  if (!order) {
    order = await Order.create({
      user: user._id,
      items: [{
        rawMaterial: rawMaterial._id,
        quantity: 2,
        price: 100
      }],
      totalAmount: 200,
      shippingAddress: {
        name: 'Test User',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'India',
        phone: '9999999999'
      },
      status: 'delivered',
      paymentStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentInfo: {}
    });
    console.log('Created test order:', order._id);
  } else {
    console.log('Test order already exists:', order._id);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
}); 