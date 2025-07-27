// app/api/order/history/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';

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