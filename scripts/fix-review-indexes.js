const { MongoClient } = require('mongodb');

async function fixReviewIndexes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const reviewsCollection = db.collection('reviews');

    // List current indexes
    console.log('Current indexes:');
    const indexes = await reviewsCollection.indexes();
    indexes.forEach(index => {
      console.log('- ', index.name, ':', JSON.stringify(index.key));
    });

    // Drop the problematic old index
    try {
      await reviewsCollection.dropIndex('userId_1_rawMaterialId_1');
      console.log('✅ Dropped old index: userId_1_rawMaterialId_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index userId_1_rawMaterialId_1 does not exist (already dropped)');
      } else {
        console.log('❌ Error dropping index:', error.message);
      }
    }

    // Create new index with partial filter for active reviews only
    try {
      await reviewsCollection.createIndex(
        { userId: 1, rawMaterialId: 1, isActive: 1 },
        { 
          unique: true, 
          partialFilterExpression: { isActive: true },
          name: 'userId_1_rawMaterialId_1_isActive_1_unique_active'
        }
      );
      console.log('✅ Created new index with partial filter for active reviews');
    } catch (error) {
      console.log('❌ Error creating new index:', error.message);
    }

    // List indexes after changes
    console.log('\nIndexes after changes:');
    const newIndexes = await reviewsCollection.indexes();
    newIndexes.forEach(index => {
      console.log('- ', index.name, ':', JSON.stringify(index.key));
      if (index.partialFilterExpression) {
        console.log('  Partial filter:', JSON.stringify(index.partialFilterExpression));
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixReviewIndexes();
