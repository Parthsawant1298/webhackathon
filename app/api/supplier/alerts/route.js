// app/api/supplier/alerts/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/supplier';
import RawMaterial from '@/models/rawMaterial';
import Order from '@/models/order';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Check supplier authentication
    const cookieStore = await cookies();
    const supplierSessionCookie = cookieStore.get('supplier-session')?.value;
    
    if (!supplierSessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supplierSession = JSON.parse(supplierSessionCookie);
    const supplierId = new mongoose.Types.ObjectId(supplierSession.id);

    await connectDB();
    
    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 403 });
    }

    // Get all raw material IDs for the current supplier
    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId }).select('_id').lean();
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    // Get various alerts and notifications relevant to the supplier
    const [
      lowStockRawMaterials,
      outOfStockRawMaterials,
      processingOrders,
      recentOrders,
      failedPaymentOrders
    ] = await Promise.all([
      // Raw materials with low stock (quantity <= 5 but > 0)
      RawMaterial.find({ 
        createdBy: supplierId,
        quantity: { $lte: 5, $gt: 0 } 
      })
      .select('name quantity category price mainImage')
      .sort({ quantity: 1 })
      .limit(10),
      
      // Raw materials that are out of stock
      RawMaterial.find({ 
        createdBy: supplierId,
        quantity: 0 
      })
      .select('name category price mainImage createdAt')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Orders that need attention (processing status) for this supplier's items
      Order.find({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        status: 'processing',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
      .populate('user', 'vendorName email')
      .select('totalAmount createdAt status user items')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Recent orders (last 7 days) containing this supplier's items
      Order.find({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
      .populate('user', 'vendorName email')
      .select('totalAmount createdAt status user')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Failed payment orders containing this supplier's items
      Order.find({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        paymentStatus: 'failed',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('user', 'vendorName email')
      .select('totalAmount createdAt paymentStatus user')
      .sort({ createdAt: -1 })
      .limit(5)
    ]);

    // Calculate alert counts
    const alertCounts = {
      lowStock: lowStockRawMaterials.length,
      outOfStock: outOfStockRawMaterials.length,
      processingOrders: processingOrders.length,
      recentOrders: recentOrders.length,
      failedPayments: failedPaymentOrders.length
    };

    // Total alerts count
    const totalAlerts = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      alertCounts,
      totalAlerts,
      alerts: {
        lowStockRawMaterials,
        outOfStockRawMaterials,
        processingOrders,
        recentOrders,
        failedPaymentOrders
      }
    });

  } catch (error) {
    console.error('Supplier alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    );
  }
}
