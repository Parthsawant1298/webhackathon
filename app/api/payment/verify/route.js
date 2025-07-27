// app/api/payment/verify/route.js - FIXED VERSION with proper error handling and rollback
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

function createEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14
  });
}

async function sendReceiptEmail(order, user, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createEmailTransporter();

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

      console.log(`Email sent successfully on attempt ${attempt}:`, info.messageId);
      return true;
    } catch (error) {
      console.error(`Email sending attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('All email sending attempts failed');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return false;
}

async function rollbackStockChanges(orderItems, session) {
  try {
    console.log('🔄 Rolling back stock changes...');
    
    for (const item of orderItems) {
      await RawMaterial.findByIdAndUpdate(
        item.rawMaterial._id,
        { 
          $inc: { quantity: item.quantity }
        },
        { session }
      );
      console.log(`✅ Restored ${item.quantity} units for ${item.rawMaterial.name}`);
    }
    
    console.log('✅ Stock rollback completed');
  } catch (rollbackError) {
    console.error('❌ Critical: Stock rollback failed:', rollbackError);
  }
}

async function markOrderAsFailed(orderId, reason, session) {
  try {
    await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'payment failed',
          paymentStatus: 'failed',
          failureReason: reason,
          failedAt: new Date()
        }
      },
      { session }
    );
    console.log(`Order ${orderId} marked as failed: ${reason}`);
  } catch (error) {
    console.error('Error marking order as failed:', error);
  }
}

export async function POST(request) {
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
    
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature
    );
    
    if (!isValidSignature) {
      console.error('Invalid payment signature detected');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': razorpayOrderId,
      user: userId
    }).populate('items.rawMaterial');
    
    if (!order) {
      console.error('Order not found for payment verification');
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    if (order.status === 'processing' && order.paymentStatus === 'completed') {
      console.log('Order already processed, returning success');
      return NextResponse.json({
        success: true,
        message: 'Order already processed',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    }
    
    console.log('Processing payment verification for order:', order._id);
    console.log('Order items:', order.items.length);
    
    const transactionResult = await session.withTransaction(async () => {
      console.log('Starting atomic transaction for payment processing...');
      
      try {
        const stockUpdates = [];
        
        for (const item of order.items) {
          console.log(`Validating stock for: ${item.rawMaterial.name}, ordered: ${item.quantity}`);
          
          const updatedMaterial = await RawMaterial.findOneAndUpdate(
            { 
              _id: item.rawMaterial._id,
              quantity: { $gte: item.quantity },
              isActive: true
            },
            { 
              $inc: { quantity: -item.quantity }
            },
            { 
              new: true,
              session,
              runValidators: false
            }
          );
          
          if (!updatedMaterial) {
            const currentMaterial = await RawMaterial.findById(item.rawMaterial._id, null, { session });
            
            if (!currentMaterial) {
              throw new Error(`Raw material ${item.rawMaterial.name} no longer exists`);
            }
            
            if (!currentMaterial.isActive) {
              throw new Error(`Raw material ${item.rawMaterial.name} is no longer active`);
            }
            
            throw new Error(`Insufficient stock for ${item.rawMaterial.name}. Available: ${currentMaterial.quantity}, Requested: ${item.quantity}`);
          }
          
          stockUpdates.push({
            materialId: item.rawMaterial._id,
            materialName: item.rawMaterial.name,
            quantityReduced: item.quantity,
            newQuantity: updatedMaterial.quantity
          });
          
          console.log(`✅ Stock updated for ${item.rawMaterial.name}: ${updatedMaterial.quantity} remaining`);
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
          order._id,
          {
            $set: {
              status: 'processing',
              paymentStatus: 'completed',
              'paymentInfo.razorpayPaymentId': razorpayPaymentId,
              'paymentInfo.razorpaySignature': razorpaySignature,
              processedAt: new Date()
            }
          },
          { 
            new: true,
            session
          }
        ).populate('items.rawMaterial');
        
        console.log('✅ Order status updated to processing within transaction');
        
        return {
          order: updatedOrder,
          stockUpdates
        };
        
      } catch (transactionError) {
        console.error('❌ Transaction failed:', transactionError.message);
        
        await markOrderAsFailed(order._id, transactionError.message, session);
        
        throw transactionError;
      }
    }, {
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true },
      maxCommitTimeMS: 30000
    });
    
    console.log('✅ Payment transaction completed successfully');
    
    let emailSent = false;
    let user = null;
    
    try {
      user = await User.findById(userId);
      
      if (user && user.email) {
        console.log('Sending receipt email to:', user.email);
        emailSent = await sendReceiptEmail(transactionResult.order, user);
        console.log('Email sent status:', emailSent);
      }
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError);
    }
    
    try {
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } }
      );
      console.log('✅ Cart cleared');
    } catch (cartError) {
      console.error('Cart clearing failed (non-critical):', cartError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified and order processed successfully',
      emailSent,
      order: {
        id: transactionResult.order._id,
        status: transactionResult.order.status,
        paymentStatus: transactionResult.order.paymentStatus,
        totalAmount: transactionResult.order.totalAmount
      },
      stockUpdates: transactionResult.stockUpdates
    });
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
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
    
    if (error.message.includes('Transaction')) {
      return NextResponse.json(
        { 
          error: 'Payment processing failed due to system error',
          details: 'Please contact support if amount was deducted',
          type: 'transaction_error'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment', 
        details: error.message,
        type: 'general_error'
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}