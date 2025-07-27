// app/api/supplier/rawmaterials/route.js - FIXED VERSION
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Supplier from '@/models/supplier';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get supplier's raw materials
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    
    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch raw materials for the supplier
    const rawMaterials = await RawMaterial.find({ 
      createdBy: supplierId,
      isActive: true 
    })
    .populate('createdBy', 'supplierName email')
    .sort({ createdAt: -1 })
    .lean();
    
    return NextResponse.json({
      success: true,
      rawMaterials,
      total: rawMaterials.length
    });
    
  } catch (error) {
    console.error('Fetch supplier raw materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch raw materials', details: error.message },
      { status: 500 }
    );
  }
}

// Create new raw material
export async function POST(request) {
  try {
    await connectDB();
    
    // Get supplier session from cookie
    const cookieStore = await cookies();
    const supplierSession = cookieStore.get('supplier-session');
    
    if (!supplierSession) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const sessionSupplier = JSON.parse(supplierSession.value);
    const supplierId = sessionSupplier.id;
    
    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name');
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice')) : null;
    const quantity = parseInt(formData.get('quantity'));
    const category = formData.get('category');
    const subcategory = formData.get('subcategory');
    const features = formData.get('features');
    const tags = formData.get('tags');
    
    // Validation
    if (!name || !description || !price || !quantity || !category || !subcategory) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }
    
    if (price <= 0 || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be positive and quantity must be non-negative' },
        { status: 400 }
      );
    }
    
    // Extract and upload images
    const imageFiles = [];
    for (let i = 0; i < 10; i++) {
      const imageFile = formData.get(`image${i}`);
      if (imageFile) {
        imageFiles.push(imageFile);
      }
    }
    
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }
    
    // Upload images to Cloudinary
    const uploadedImages = [];
    let mainImage = null;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'supplymind/raw-materials',
            public_id: `${supplierId}_${Date.now()}_${i}`,
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });
      
      const imageData = {
        url: uploadResponse.secure_url,
        alt: `${name} - Image ${i + 1}`
      };
      
      uploadedImages.push(imageData);
      
      // First image becomes main image
      if (i === 0) {
        mainImage = uploadResponse.secure_url;
      }
    }
    
    // Calculate discount if originalPrice is provided
    let discount = 0;
    if (originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    
    // Process features and tags
    const featuresArray = features ? features.split(',').map(f => f.trim()).filter(f => f) : [];
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Create raw material
    const rawMaterial = await RawMaterial.create({
      name: name.trim(),
      description: description.trim(),
      price,
      originalPrice,
      discount,
      quantity,
      category: category.trim(),
      subcategory: subcategory.trim(),
      features: featuresArray,
      tags: tagsArray,
      images: uploadedImages,
      mainImage,
      createdBy: supplierId,
      ratings: 0,
      numReviews: 0,
      isActive: true
    });
    
    // Populate the created raw material
    const populatedRawMaterial = await RawMaterial.findById(rawMaterial._id)
      .populate('createdBy', 'supplierName email businessType')
      .lean();
    
    return NextResponse.json({
      success: true,
      message: 'Raw material created successfully',
      rawMaterial: populatedRawMaterial
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create raw material error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: messages[0] },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create raw material', details: error.message },
      { status: 500 }
    );
  }
}

// Update raw material
export async function PUT(request) {
  try {
    await connectDB();
    
    // Get supplier session from cookie
    const cookieStore = await cookies();
    const supplierSession = cookieStore.get('supplier-session');
    
    if (!supplierSession) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const sessionSupplier = JSON.parse(supplierSession.value);
    const supplierId = sessionSupplier.id;
    
    const { rawMaterialId, ...updateData } = await request.json();
    
    if (!rawMaterialId) {
      return NextResponse.json(
        { success: false, error: 'Raw material ID is required' },
        { status: 400 }
      );
    }
    
    // Find and update the raw material (only if owned by supplier)
    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { _id: rawMaterialId, createdBy: supplierId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'supplierName email businessType');
    
    if (!rawMaterial) {
      return NextResponse.json(
        { success: false, error: 'Raw material not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Raw material updated successfully',
      rawMaterial
    });
    
  } catch (error) {
    console.error('Update raw material error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update raw material', details: error.message },
      { status: 500 }
    );
  }
}

// Delete raw material (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get supplier session from cookie
    const cookieStore = await cookies();
    const supplierSession = cookieStore.get('supplier-session');
    
    if (!supplierSession) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const sessionSupplier = JSON.parse(supplierSession.value);
    const supplierId = sessionSupplier.id;
    
    const { searchParams } = new URL(request.url);
    const rawMaterialId = searchParams.get('id');
    
    if (!rawMaterialId) {
      return NextResponse.json(
        { success: false, error: 'Raw material ID is required' },
        { status: 400 }
      );
    }
    
    // Soft delete the raw material (only if owned by supplier)
    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { _id: rawMaterialId, createdBy: supplierId },
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!rawMaterial) {
      return NextResponse.json(
        { success: false, error: 'Raw material not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Raw material deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete raw material error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete raw material', details: error.message },
      { status: 500 }
    );
  }
}