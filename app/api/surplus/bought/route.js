import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
const Surplus = require('../../../../models/surplus');

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

export async function GET(req) {
  await dbConnect();
  const auth = await getSupplier(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const surplus = await Surplus.find({ acceptedBy: auth.id, status: 'Sold' }).lean();
  const anonymized = surplus.map(item => ({
    ...item,
    vendorCode: `VENDOR_${item.vendorId.toString().slice(-3).toUpperCase()}`,
    vendorId: undefined,
  }));
  return NextResponse.json({ success: true, surplus: anonymized });
} 