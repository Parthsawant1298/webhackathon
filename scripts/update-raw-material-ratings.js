// Utility script to update all raw material ratings based on reviews
import connectDB from '../lib/mongodb.js';
import RawMaterial from '../models/rawMaterial.js';
import Review from '../models/review.js';

async function updateAllRawMaterialRatings() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all raw materials
    const rawMaterials = await RawMaterial.find({ isActive: true });
    console.log(`Found ${rawMaterials.length} raw materials to update`);

    let updated = 0;
    let skipped = 0;

    for (const material of rawMaterials) {
      try {
        // Get all active reviews for this raw material
        const reviews = await Review.find({ 
          rawMaterialId: material._id, 
          isActive: true 
        });
        
        let avgRating = 0;
        const numReviews = reviews.length;
        
        if (numReviews > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          avgRating = Math.round((totalRating / numReviews) * 10) / 10; // Round to 1 decimal
        }
        
        // Update the raw material
        await RawMaterial.findByIdAndUpdate(material._id, {
          ratings: avgRating,
          numReviews: numReviews
        });
        
        console.log(`Updated ${material.name}: ${avgRating} stars (${numReviews} reviews)`);
        updated++;
        
      } catch (error) {
        console.error(`Error updating ${material.name}:`, error.message);
        skipped++;
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`- Successfully updated: ${updated} materials`);
    console.log(`- Skipped due to errors: ${skipped} materials`);
    
  } catch (error) {
    console.error('Error updating raw material ratings:', error);
  } finally {
    process.exit(0);
  }
}

// Run the update
updateAllRawMaterialRatings();
