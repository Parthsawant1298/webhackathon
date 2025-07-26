import connectDB from '@/lib/mongodb';
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

export async function POST(request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const supplierSession = cookieStore.get('supplier-session');
    
    if (!supplierSession) {
      return NextResponse.json(
        { success: false, message: 'No active session' },
        { status: 401 }
      );
    }

    const sessionSupplier = JSON.parse(supplierSession.value);
    
    // Handle FormData for file upload
    const formData = await request.formData();
    const profileImageFile = formData.get('profileImage');
    
    if (!profileImageFile) {
      return NextResponse.json(
        { success: false, message: 'Profile image file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!profileImageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (profileImageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size should not exceed 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await profileImageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'supplymind/supplier-profile-pictures',
          public_id: `supplier_${sessionSupplier.id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
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

    // Find supplier to get old profile picture
    const currentSupplier = await Supplier.findById(sessionSupplier.id);
    
    // Delete old profile picture from Cloudinary if exists
    if (currentSupplier?.profilePicture) {
      try {
        // Extract public_id from the old URL
        const urlParts = currentSupplier.profilePicture.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        const fullPublicId = `supplymind/supplier-profile-pictures/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (deleteError) {
        console.warn('Failed to delete old profile picture:', deleteError);
        // Continue anyway, don't fail the upload
      }
    }
    
    // Update supplier profile picture in database
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      sessionSupplier.id,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    if (!updatedSupplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Update session data
    const newSessionSupplier = {
      id: updatedSupplier._id,
      name: updatedSupplier.supplierName,
      supplierName: updatedSupplier.supplierName,
      email: updatedSupplier.email,
      phone: updatedSupplier.phone,
      businessAddress: updatedSupplier.businessAddress,
      businessType: updatedSupplier.businessType,
      supplierID: updatedSupplier.supplierID,
      profilePicture: updatedSupplier.profilePicture
    };

    // Update cookie
    const response = NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
      supplier: newSessionSupplier,
      profilePicture: updatedSupplier.profilePicture
    });

    response.cookies.set('supplier-session', JSON.stringify(newSessionSupplier), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Upload supplier profile picture error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}
