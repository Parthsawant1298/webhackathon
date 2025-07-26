// app/api/payment/create/route.js
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
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.rawMaterial');
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }
    
    // Verify raw material availability at checkout time
    const availabilityIssues = [];
    
    for (const item of cart.items) {
      if (!item.rawMaterial) {
        availabilityIssues.push({
          rawMaterialId: null,
          name: 'Unknown Raw Material',
          requestedQuantity: item.quantity, 
          availableQuantity: 0,
          message: 'Raw material no longer exists'
        });
        continue;
      }
      
      // Check against actual raw material quantity
      if (item.rawMaterial.quantity < item.quantity) {
        availabilityIssues.push({
          rawMaterialId: item.rawMaterial._id,
          name: item.rawMaterial.name,
          requestedQuantity: item.quantity,
          availableQuantity: item.rawMaterial.quantity,
          message: `Only ${item.rawMaterial.quantity} units available`
        });
      }
    }
    
    // If there are availability issues, return them
    if (availabilityIssues.length > 0) {
      return NextResponse.json({ 
        error: 'Some raw materials in your cart are no longer available in the requested quantity',
        availabilityIssues 
      }, { status: 400 });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.rawMaterial.price * item.quantity;
      totalAmount += itemTotal;
      
      return {
        rawMaterial: item.rawMaterial._id,
        quantity: item.quantity,
        price: item.rawMaterial.price
      };
    });
    
    // Get shipping address from request
    const { shippingAddress } = await request.json();
    
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