// app/api/payment/create/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';
import User from '@/models/user';

// Validate and initialize Razorpay
const initializeRazorpay = () => {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay Credentials:', {
      keyId: keyId ? 'Present' : 'Missing',
      keySecret: keySecret ? 'Present' : 'Missing'
    });
    throw new Error('Razorpay credentials are missing');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get user's cart with populated raw materials
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.rawMaterial',
        select: 'name price quantity isActive mainImage',
        match: { isActive: true } // Only get active raw materials
      });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }
    
    // Filter out items where rawMaterial is null (inactive/deleted materials)
    const validItems = cart.items.filter(item => item.rawMaterial !== null);
    
    if (validItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid items in cart. Some materials may no longer be available.' },
        { status: 400 }
      );
    }
    
    // Verify raw material availability at checkout time
    const availabilityIssues = [];
    
    for (const item of validItems) {
      // Double-check availability with fresh data from database
      const freshMaterial = await RawMaterial.findById(item.rawMaterial._id);
      
      if (!freshMaterial || !freshMaterial.isActive) {
        availabilityIssues.push({
          rawMaterialId: item.rawMaterial._id,
          name: item.rawMaterial.name,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
          message: 'Raw material no longer available'
        });
        continue;
      }
      
      // Check against actual raw material quantity
      if (freshMaterial.quantity < item.quantity) {
        availabilityIssues.push({
          rawMaterialId: freshMaterial._id,
          name: freshMaterial.name,
          requestedQuantity: item.quantity,
          availableQuantity: freshMaterial.quantity,
          message: `Only ${freshMaterial.quantity} units available`
        });
      }
    }
    
    // If there are availability issues, return them
    if (availabilityIssues.length > 0) {
      // Update cart to remove invalid items
      const validItemIds = validItems
        .filter(item => !availabilityIssues.some(issue => 
          issue.rawMaterialId.toString() === item.rawMaterial._id.toString()
        ))
        .map(item => ({
          rawMaterial: item.rawMaterial._id,
          quantity: item.quantity,
          addedAt: item.addedAt
        }));
      
      await Cart.findByIdAndUpdate(cart._id, { items: validItemIds });
      
      return NextResponse.json({ 
        error: 'Some raw materials in your cart are no longer available in the requested quantity',
        availabilityIssues 
      }, { status: 400 });
    }
    
    // Calculate total amount using fresh material data
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of validItems) {
      const freshMaterial = await RawMaterial.findById(item.rawMaterial._id);
      const itemTotal = freshMaterial.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        rawMaterial: freshMaterial._id,
        quantity: item.quantity,
        price: freshMaterial.price
      });
    }
    
    // Get shipping address from request
    const { shippingAddress } = await request.json();
    
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }
    
    // Create a pending order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'payment failed',
      paymentStatus: 'pending'
    });
    
    // Initialize Razorpay
    let razorpay;
    try {
      razorpay = initializeRazorpay();
    } catch (initError) {
      console.error('Razorpay Initialization Error:', initError);
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: order._id.toString()
    });
    
    // Update order with Razorpay order ID
    order.paymentInfo = {
      razorpayOrderId: razorpayOrder.id
    };
    await order.save();
    
    // Return the order and Razorpay order details
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        amount: totalAmount,
        items: orderItems.length
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      },
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
    });
    
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}