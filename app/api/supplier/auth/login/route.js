import connectDB from '@/lib/mongodb';
import Supplier from '@/models/supplier';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find supplier and include password for comparison
    const supplier = await Supplier.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if supplier is active
    if (!supplier.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await supplier.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session data (map supplierName to name for frontend consistency)
    const sessionSupplier = {
      id: supplier._id,
      name: supplier.supplierName, // Frontend expects 'name' field
      supplierName: supplier.supplierName,
      email: supplier.email,
      phone: supplier.phone,
      businessAddress: supplier.businessAddress,
      businessType: supplier.businessType,
      supplierID: supplier.supplierID,
      profilePicture: supplier.profilePicture
    };

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      supplier: sessionSupplier
    });

    response.cookies.set('supplier-session', JSON.stringify(sessionSupplier), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Supplier login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
