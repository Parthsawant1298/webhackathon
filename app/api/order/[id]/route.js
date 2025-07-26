// app/api/order/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

export async function GET(request, { params }) {
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
    
    // Find the specific order for the user
    const order = await Order.findOne({ 
      _id: (await params).id, 
      user: userId 
    })
    .populate({
      path: 'items.rawMaterial',
      select: 'name mainImage price description category'
    })
    .lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Fetch order details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details', details: error.message },
      { status: 500 }
    );
  }
}

// app/api/order/history/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

export async function GET(request) {
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
    
    // Find all orders for the user, sorted by most recent first
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.rawMaterial',
        select: 'name mainImage price'
      })
      .lean();
    
    return NextResponse.json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('Fetch order history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order history', details: error.message },
      { status: 500 }
    );
  }
}

// app/api/order/recent/route.js
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
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
    
    // Find the most recent order for the user
    const order = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.rawMaterial')
      .lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'No recent orders found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Fetch recent order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent order', details: error.message },
      { status: 500 }
    );
  }
}