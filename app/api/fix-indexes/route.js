import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';

export async function POST() {
  try {
    await connectDB();
    
    console.log('Starting index fix...');
    
    // Get the underlying collection
    const collection = Review.collection;
    
    // List current indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('- ', index.name, ':', JSON.stringify(index.key));
    });

    // Drop the problematic old index
    try {
      await collection.dropIndex('userId_1_rawMaterialId_1');
      console.log('✅ Dropped old index: userId_1_rawMaterialId_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index userId_1_rawMaterialId_1 does not exist (already dropped)');
      } else {
        console.log('❌ Error dropping index:', error.message);
      }
    }

    // Also try to drop any other problematic indexes
    try {
      await collection.dropIndex('userId_1_rawMaterialId_1_isActive_1');
      console.log('✅ Dropped index: userId_1_rawMaterialId_1_isActive_1');
    } catch (error) {
      console.log('⚠️  Index userId_1_rawMaterialId_1_isActive_1 does not exist');
    }

    // Create new index with partial filter for active reviews only
    try {
      await collection.createIndex(
        { userId: 1, rawMaterialId: 1 },
        { 
          unique: true, 
          partialFilterExpression: { isActive: true },
          name: 'unique_active_user_material_review'
        }
      );
      console.log('✅ Created new index with partial filter for active reviews');
    } catch (error) {
      console.log('❌ Error creating new index:', error.message);
    }

    // List indexes after changes
    console.log('\nIndexes after changes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('- ', index.name, ':', JSON.stringify(index.key));
      if (index.partialFilterExpression) {
        console.log('  Partial filter:', JSON.stringify(index.partialFilterExpression));
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Indexes fixed successfully',
      indexes: newIndexes.map(idx => ({ name: idx.name, key: idx.key, partial: idx.partialFilterExpression }))
    });

  } catch (error) {
    console.error('Error fixing indexes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
