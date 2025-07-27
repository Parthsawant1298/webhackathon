// app/api/order/[id]/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';

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