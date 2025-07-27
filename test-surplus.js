const mongoose = require('mongoose');
const Surplus = require('./models/surplus');

async function testSurplus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://parthsawant1298:kLkvVsb6NqRGwk0f@cluster0.0ohnswl.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if Surplus model exists
    console.log('\n📋 Testing Surplus model...');
    const surplusCount = await Surplus.countDocuments();
    console.log(`Current surplus count: ${surplusCount}`);

    // Test 2: Try to create a test surplus
    console.log('\n➕ Creating test surplus...');
    const testSurplus = new Surplus({
      rawMaterialName: 'Test Tomatoes',
      pricePerKg: 15,
      quantity: 10,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      vendorId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Test vendor ID
      status: 'Pending'
    });

    const savedSurplus = await testSurplus.save();
    console.log('✅ Test surplus created:', savedSurplus._id);

    // Test 3: Check if it was saved
    const newCount = await Surplus.countDocuments();
    console.log(`New surplus count: ${newCount}`);

    // Test 4: List all surplus
    console.log('\n📋 All surplus in database:');
    const allSurplus = await Surplus.find().lean();
    allSurplus.forEach((item, index) => {
      console.log(`${index + 1}. ${item.rawMaterialName} - ₹${item.pricePerKg}/kg - ${item.quantity}kg - Status: ${item.status}`);
    });

    // Test 5: Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Surplus.findByIdAndDelete(savedSurplus._id);
    console.log('✅ Test surplus deleted');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSurplus(); 