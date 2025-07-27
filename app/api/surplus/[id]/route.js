import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
const Surplus = require('../../../../models/surplus');

// Helper to get vendor from cookies
async function getVendor(req) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (userId) return { id: userId };
  return null;
}

export async function PUT(req, { params }) {
  await dbConnect();
  const auth = await getVendor(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const body = await req.json();
  const surplus = await Surplus.findOneAndUpdate(
    { _id: id, vendorId: auth.id, status: 'Pending' },
    body,
    { new: true }
  );
  if (!surplus) {
    return NextResponse.json({ success: false, message: 'Not found or cannot edit' }, { status: 404 });
  }
  return NextResponse.json({ success: true, surplus });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const auth = await getVendor(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const surplus = await Surplus.findOneAndDelete({ _id: id, vendorId: auth.id, status: 'Pending' });
  if (!surplus) {
    return NextResponse.json({ success: false, message: 'Not found or cannot delete' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
} 