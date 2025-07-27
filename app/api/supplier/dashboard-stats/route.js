// app/api/supplier/dashboard-stats/route.js
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
    const cookieStore = await cookies();
    const supplierSessionCookie = cookieStore.get('supplier-session')?.value;
    
    if (!supplierSessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supplierSession = JSON.parse(supplierSessionCookie);
    const supplierId = new mongoose.Types.ObjectId(supplierSession.id);

    await connectDB();
    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 403 });
    }

    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId }).select('_id').lean();
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    const [
      totalRawMaterials,
      totalVendors,
      totalOrders,
      revenueData,
      recentRawMaterials,
      recentOrders,
      categoryStats,
      monthlyRevenue,
      lowStockRawMaterialsCount,
      outOfStockRawMaterialsCount,
      processingOrdersCount,
      deliveredOrdersCount,
      paymentFailedOrdersCount
    ] = await Promise.all([
      RawMaterial.countDocuments({ createdBy: supplierId }),
      
      Order.distinct('user', { 'items.rawMaterial': { $in: supplierRawMaterialIds } }),
      
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds } }),
      
      Order.aggregate([
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds }, paymentStatus: 'completed' } },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        { $group: { _id: null, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
      ]),
      
      RawMaterial.find({ createdBy: supplierId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category subcategory price quantity createdAt mainImage'),
      
      Order.find({ 'items.rawMaterial': { $in: supplierRawMaterialIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'vendorName email')
        .select('totalAmount status paymentStatus createdAt'),
      
      RawMaterial.aggregate([
        { $match: { createdBy: supplierId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      Order.aggregate([
        {
          $match: {
            'items.rawMaterial': { $in: supplierRawMaterialIds },
            paymentStatus: 'completed',
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderCount: { $addToSet: '$_id' }
          }
        },
        { $addFields: { orderCount: { $size: '$orderCount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      RawMaterial.countDocuments({ createdBy: supplierId, quantity: { $lte: 5, $gt: 0 } }),
      
      RawMaterial.countDocuments({ createdBy: supplierId, quantity: 0 }),
      
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, status: 'processing' }),

      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, status: 'delivered' }),
      
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, paymentStatus: 'failed' })
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    const recentActivity = [];
    
    const recentOrdersActivity = recentOrders.map(order => ({
      type: 'order',
      description: `New order ₹${order.totalAmount.toLocaleString()} from ${order.user?.vendorName || 'Unknown Vendor'}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    const recentRawMaterialsActivity = recentRawMaterials.map(material => ({
      type: 'rawmaterial',
      description: `New raw material "${material.name}" added to ${material.category}`,
      timestamp: material.createdAt,
      status: 'active'
    }));
    
    recentActivity.push(...recentOrdersActivity, ...recentRawMaterialsActivity);
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRawMaterials,
        totalVendors: totalVendors.length,
        totalOrders,
        totalRevenue,
        lowStockRawMaterials: lowStockRawMaterialsCount,
        outOfStockRawMaterials: outOfStockRawMaterialsCount,
        processingOrders: processingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        paymentFailedOrders: paymentFailedOrdersCount
      },
      recentRawMaterials,
      recentOrders,
      recentActivity: recentActivity.slice(0, 10),
      categoryStats,
      monthlyRevenue,
      insights: {
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        conversionRate: totalVendors.length > 0 ? Math.round((totalOrders / totalVendors.length) * 100) : 0,
        topCategory: categoryStats.length > 0 ? categoryStats[0]._id : 'No raw materials yet'
      }
    });

  } catch (error) {
    console.error('Supplier dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}