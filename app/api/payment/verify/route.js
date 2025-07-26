// app/api/payment/verify/route.js - FIXED VERSION WITH ATOMIC TRANSACTIONS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';
import User from '@/models/user';

// Verify Razorpay signature
function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    console.error('Missing signature verification parameters');
    return false;
  }

  const text = razorpayOrderId + '|' + razorpayPaymentId;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    console.error('Razorpay key secret is missing');
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Create email transporter
function createEmailTransporter() {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Send email receipt to customer
async function sendReceiptEmail(order, user) {
  try {
    const transporter = createEmailTransporter();

    // Format order items for email
    const itemsList = order.items.map(item => {
      const rawMaterial = item.rawMaterial;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${rawMaterial.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    // Create the email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488; margin: 0;">SupplyMind</h1>
          <p style="color: #666;">Raw Materials Order Confirmation</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Payment ID:</strong> ${order.paymentInfo.razorpayPaymentId}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Raw Materials Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Raw Material</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #666; text-align: center;">Thank you for your order! Your raw materials will be processed and shipped soon.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"SupplyMind" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Raw Materials Order Confirmation #${order._id}`,
      html: emailHtml
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function POST(request) {
  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  
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
    
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = await request.json();
    
    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature
    );
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    // Find the order
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': razorpayOrderId,
      user: userId
    }).populate('items.rawMaterial');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Processing order:', order._id);
    console.log('Order items:', order.items.length);
    
    // Start transaction for atomic stock updates
    const transactionResult = await session.withTransaction(async () => {
      console.log('Starting atomic transaction for stock updates...');
      
      // Process each item in the order atomically
      for (const item of order.items) {
        console.log(`Processing item: ${item.rawMaterial.name}, ordered: ${item.quantity}`);
        
        // Use findOneAndUpdate with stock check for atomic operation
        const updatedMaterial = await RawMaterial.findOneAndUpdate(
          { 
            _id: item.rawMaterial._id,
            quantity: { $gte: item.quantity }, // Ensure sufficient stock
            isActive: true
          },
          { 
            $inc: { quantity: -item.quantity } // Atomic decrement
          },
          { 
            new: true,
            session, // Use transaction session
            runValidators: false // Allow quantity to reach 0
          }
        );
        
        if (!updatedMaterial) {
          // Stock insufficient or material not found
          const currentMaterial = await RawMaterial.findById(item.rawMaterial._id, null, { session });
          
          if (!currentMaterial) {
            throw new Error(`Raw material ${item.rawMaterial.name} no longer exists`);
          }
          
          if (!currentMaterial.isActive) {
            throw new Error(`Raw material ${item.rawMaterial.name} is no longer active`);
          }
          
          throw new Error(`Insufficient stock for ${item.rawMaterial.name}. Available: ${currentMaterial.quantity}, Requested: ${item.quantity}`);
        }
        
        console.log(`✅ Atomically updated ${item.rawMaterial.name}: ${updatedMaterial.quantity} remaining`);
      }
      
      // Update order status within the same transaction
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          $set: {
            status: 'processing',
            paymentStatus: 'completed',
            'paymentInfo.razorpayPaymentId': razorpayPaymentId,
            'paymentInfo.razorpaySignature': razorpaySignature
          }
        },
        { 
          new: true,
          session
        }
      ).populate('items.rawMaterial');
      
      console.log('✅ Order status updated to processing within transaction');
      return updatedOrder;
    });
    
    console.log('✅ Transaction completed successfully');
    
    // Get user data for email (outside transaction)
    const user = await User.findById(userId);
    
    // Send receipt email
    let emailSent = false;
    if (user && user.email) {
      console.log('Sending receipt email to:', user.email);
      emailSent = await sendReceiptEmail(transactionResult, user);
      console.log('Email sent status:', emailSent);
    }
    
    // Clear the user's cart (outside transaction)
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );
    console.log('Cart cleared');
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified and order processed successfully',
      emailSent,
      order: {
        id: transactionResult._id,
        status: transactionResult.status,
        paymentStatus: transactionResult.paymentStatus
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Check if it's a stock-related error
    if (error.message.includes('Insufficient stock') || 
        error.message.includes('no longer exists') || 
        error.message.includes('no longer active')) {
      return NextResponse.json(
        { 
          error: 'Stock availability changed during payment processing',
          details: error.message,
          type: 'stock_error'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  } finally {
    // Always end the session
    await session.endSession();
  }
}