// app/api/order/recent/route.js - FIXED VERSION
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';
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