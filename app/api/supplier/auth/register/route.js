import connectDB from '@/lib/mongodb';
import Supplier from '@/models/supplier';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const { supplierName, email, password, phone, businessAddress, businessType } = await request.json();

    // Input validation
    if (!supplierName || !email || !password || !phone || !businessAddress || !businessType) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
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

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Phone number validation
    if (phone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Check if supplier already exists
    const existingSupplier = await Supplier.findOne({ email: email.toLowerCase() });
    
    if (existingSupplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier with this email already exists' },
        { status: 409 }
      );
    }

    // Create new supplier
    const supplierData = {
      supplierName: supplierName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      businessAddress: businessAddress.trim(),
      businessType: businessType.trim(),
      name: supplierName.trim() // Add name field for frontend consistency
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    // Return supplier data without password
    const responseSupplier = {
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

    return NextResponse.json({
      success: true,
      message: 'Supplier registered successfully',
      supplier: responseSupplier
    }, { status: 201 });

  } catch (error) {
    console.error('Supplier registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, message: `Supplier with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: messages[0] },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
