import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
const Surplus = require('../../../models/surplus');
const User = require('../../../models/user');
const Supplier = require('../../../models/supplier');

// Helper to get user or supplier from cookies
async function getUserOrSupplier(req, prioritizeVendor = false) {
  console.log('🔐 Checking authentication...');
  const cookieStore = await cookies();
  const supplierSession = cookieStore.get('supplier-session');
  const userId = cookieStore.get('userId')?.value;
  
  console.log('🍪 Cookies found:', { 
    hasSupplierSession: !!supplierSession, 
    hasUserId: !!userId,
    prioritizeVendor
  });
  
  // For POST requests (vendor adding surplus), prioritize vendor session
  if (prioritizeVendor && userId) {
    console.log('✅ Vendor authenticated (prioritized):', userId);
    return { type: 'vendor', id: userId };
  }
  
  // For GET requests (supplier viewing surplus), prioritize supplier session
  if (supplierSession) {
    try {
      const supplier = JSON.parse(supplierSession.value);
      console.log('✅ Supplier authenticated:', supplier.id);
      return { type: 'supplier', id: supplier.id };
    } catch (e) {
      console.log('❌ Failed to parse supplier session');
    }
  }
  
  // Fallback to vendor if no supplier session
  if (userId) {
    console.log('✅ Vendor authenticated:', userId);
    return { type: 'vendor', id: userId };
  }
  
  console.log('❌ No authentication found');
  return null;
}

export async function GET(req) {
  console.log('📋 GET /api/surplus called');
  await dbConnect();
  const auth = await getUserOrSupplier(req, false); // Don't prioritize vendor for GET
  if (!auth || auth.type !== 'supplier') {
    console.log('❌ Unauthorized GET request');
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const surplus = await Surplus.find({ status: 'Pending' }).lean();
  console.log(`✅ Found ${surplus.length} pending surplus items`);
  const anonymized = await Promise.all(surplus.map(async (item) => {
    return {
      ...item,
      vendorCode: `VENDOR_${item.vendorId.toString().slice(-3).toUpperCase()}`,
      vendorId: undefined,
    };
  }));
  return NextResponse.json({ success: true, surplus: anonymized });
}

export async function POST(req) {
  console.log('➕ POST /api/surplus called');
  await dbConnect();
  const auth = await getUserOrSupplier(req, true); // Prioritize vendor for POST
  console.log('🔍 Auth result:', auth);
  
  if (!auth || auth.type !== 'vendor') {
    console.log('❌ Unauthorized POST request - expected vendor, got:', auth?.type);
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  console.log('📝 Request body:', body);
  const { rawMaterialName, pricePerKg, quantity, expiryDate } = body;
  if (!rawMaterialName || !pricePerKg || !quantity || !expiryDate) {
    console.log('❌ Missing required fields');
    return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
  }
  console.log('💾 Creating surplus with vendorId:', auth.id);
  const surplus = await Surplus.create({
    rawMaterialName,
    pricePerKg,
    quantity,
    expiryDate,
    vendorId: auth.id,
  });
  console.log('✅ Surplus created:', surplus._id);
  return NextResponse.json({ success: true, surplus });
} 