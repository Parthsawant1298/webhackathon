import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '../../../../../lib/mongodb';
const Surplus = require('../../../../../models/surplus');
const Supplier = require('../../../../../models/supplier');

// Helper to get supplier from cookies
async function getSupplier(req) {
  const cookieStore = await cookies();
  const supplierSession = cookieStore.get('supplier-session');
  if (supplierSession) {
    try {
      const supplier = JSON.parse(supplierSession.value);
      return { id: supplier.id };
    } catch {}
  }
  return null;
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxx',
});

export async function POST(req, { params }) {
  await dbConnect();
  const auth = await getSupplier(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const surplus = await Surplus.findOne({ _id: id, status: 'Pending' });
  if (!surplus) {
    return NextResponse.json({ success: false, message: 'Not found or already accepted' }, { status: 404 });
  }
  
  // Calculate total amount (in paise)
  const amount = Math.round(surplus.pricePerKg * surplus.quantity * 100);
  
  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `surplus_${id}`,
    payment_capture: 1,
    notes: {
      surplusId: id,
      supplierId: auth.id,
    },
  });
  
  // Store order ID and mark as accepted (but not paid yet)
  surplus.razorpayOrderId = razorpayOrder.id;
  surplus.acceptedBy = auth.id;
  await surplus.save();
  
  return NextResponse.json({ 
    success: true, 
    order: razorpayOrder, 
    surplus,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
  });
} 