import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/rawMaterial';
import Supplier from '@/models/supplier';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Configure Cloudinary with validation
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary configuration. Please check your environment variables.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function for multiple images with production optimizations
const uploadToCloudinary = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const streamifier = require('streamifier');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'rawmaterials',
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        public_id: `raw_material_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        timeout: 60000 // 60 second timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(`Image upload failed: ${error.message}`));
        }
        resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export async function POST(request) {
  try {
    // Get supplier session from cookies
    const cookieStore = await cookies();
    const supplierSessionCookie = cookieStore.get('supplier-session')?.value;
    if (!supplierSessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse supplier session
    let supplierSession;
    try {
      supplierSession = JSON.parse(supplierSessionCookie);
    } catch (parseError) {
      console.error('Failed to parse supplier session:', parseError);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const supplierId = supplierSession.id;
    if (!supplierId) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      );
    }

    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Verify supplier exists
    let supplier;
    try {
      supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        );
      }
    } catch (supplierError) {
      console.error('Supplier query error:', supplierError);
      return NextResponse.json(
        { error: 'Failed to verify supplier' },
        { status: 500 }
      );
    }

    // Get form data from request
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Form parsing error:', formError);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }
    
    const name = formData.get('name');
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const originalPrice = parseFloat(formData.get('originalPrice') || price);
    const quantity = parseInt(formData.get('quantity'));
    const category = formData.get('category');
    const subcategory = formData.get('subcategory');
    const features = formData.get('features')?.split(',').map(item => item.trim()).filter(Boolean) || [];
    const tags = formData.get('tags')?.split(',').map(item => item.trim()).filter(Boolean) || [];
    
    // Production-level validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Raw material name is required' },
        { status: 400 }
      );
    }
    
    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    
    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory is required' },
        { status: 400 }
      );
    }
    
    // Get all image files with validation
    const imageFiles = [];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    for (let i = 0; i < 10; i++) { // Limit to 10 images max
      const image = formData.get(`image${i}`);
      if (image && image instanceof File) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(image.type)) {
          return NextResponse.json(
            { error: `Invalid file type: ${image.type}. Only JPEG, PNG, and WebP images are allowed.` },
            { status: 400 }
          );
        }
        
        // Validate file size
        if (image.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large: ${image.name}. Maximum size is 5MB.` },
            { status: 400 }
          );
        }
        
        imageFiles.push(image);
      }
    }
    
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one raw material image is required' },
        { status: 400 }
      );
    }

    // Upload all images to Cloudinary with production error handling
    let uploadResults;
    try {
      const imagePromises = imageFiles.map(async (file) => {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          return await uploadToCloudinary(buffer, file.name);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          throw new Error(`Failed to process image: ${file.name}`);
        }
      });
      
      uploadResults = await Promise.all(imagePromises);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload raw material images' },
        { status: 500 }
      );
    }
    
    // Format the image data
    const images = uploadResults.map(result => ({
      url: result.secure_url,
      alt: name
    }));
    
    // Create new raw material
    console.log("About to create raw material with subcategory:", subcategory);
    const rawMaterialData = {
      name,
      description,
      price,
      originalPrice,
      discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      images,
      mainImage: images[0].url, // First image is the main image
      quantity,
      category,
      subcategory: subcategory,
      features,
      tags,
      createdBy: supplierId
    };
    
    console.log("Raw material data before creation:", JSON.stringify(rawMaterialData));
    
    let rawMaterial;
    try {
      rawMaterial = await RawMaterial.create(rawMaterialData);
    } catch (createError) {
      console.error('Raw material creation database error:', createError);
      return NextResponse.json(
        { error: 'Failed to save raw material to database', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Raw material created successfully',
      rawMaterial
    }, { status: 201 });

  } catch (error) {
    console.error('Raw material creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create raw material', details: error.message },
      { status: 500 }
    );
  }
}

// GET method to fetch all raw materials
export async function GET(request) {
  try {
    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Get query parameters
    let searchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (urlError) {
      console.error('URL parsing error:', urlError);
      return NextResponse.json(
        { error: 'Failed to parse request URL' },
        { status: 400 }
      );
    }
    
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const supplierId = searchParams.get('supplierId');
    
    // Build query object
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (supplierId) query.createdBy = supplierId;
    
    // Query raw materials with error handling
    let rawMaterials;
    try {
      rawMaterials = await RawMaterial.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('createdBy', 'supplierName'); // Include supplier's name
    } catch (queryError) {
      console.error('Raw material query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to query raw materials' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      count: rawMaterials.length,
      rawMaterials
    });
  } catch (error) {
    console.error('Fetch raw materials error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch raw materials' },
      { status: 500 }
    );
  }
}
