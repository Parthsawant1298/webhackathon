import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '../../../../../lib/mongodb';
const Surplus = require('../../../../../models/surplus');

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxx',
});

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
  // Optionally: verify signature here for extra security
  const surplus = await Surplus.findOne({ _id: id, razorpayOrderId: razorpay_order_id });
  if (!surplus) {
    return NextResponse.json({ success: false, message: 'Surplus not found or order mismatch' }, { status: 404 });
  }
  // Mark as paid/sold
  surplus.status = 'Sold';
  surplus.paymentStatus = 'Paid';
  surplus.razorpayPaymentId = razorpay_payment_id;
  await surplus.save();
  return NextResponse.json({ success: true, surplus });
} 