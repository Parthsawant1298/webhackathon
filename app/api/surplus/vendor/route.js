import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
const Surplus = require('../../../../models/surplus');
import { cookies } from 'next/headers';

// Helper to get vendor from cookies
async function getVendor(req) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (userId) return { id: userId };
  return null;
}

export async function GET(req) {
  await dbConnect();
  const auth = await getVendor(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const surplus = await Surplus.find({ vendorId: auth.id }).lean();
  return NextResponse.json({ success: true, surplus });
} 