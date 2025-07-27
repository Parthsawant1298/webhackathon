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

    // Fetch dashboard statistics relevant to the supplier
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
      // Total raw materials count for the supplier
      RawMaterial.countDocuments({ createdBy: supplierId }),
      
      // Total unique vendors who have ordered from this supplier
      Order.distinct('user', { 'items.rawMaterial': { $in: supplierRawMaterialIds } }),
      
      // Total orders containing this supplier's raw materials
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds } }),
      
      // Total revenue from completed orders for this supplier's items
      Order.aggregate([
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds }, paymentStatus: 'completed' } },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        { $group: { _id: null, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
      ]),
      
      // Recent raw materials (last 5)
      RawMaterial.find({ createdBy: supplierId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category subcategory price quantity createdAt mainImage'),
      
      // Recent orders (last 5) containing this supplier's items
      Order.find({ 'items.rawMaterial': { $in: supplierRawMaterialIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'vendorName email')
        .select('totalAmount status paymentStatus createdAt'),
      
      // Category-wise raw material distribution for this supplier
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
      
      // Monthly revenue for the last 6 months for this supplier
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
      
      // Low stock raw materials count
      RawMaterial.countDocuments({ createdBy: supplierId, quantity: { $lte: 5, $gt: 0 } }),
      
      // Out of stock raw materials count
      RawMaterial.countDocuments({ createdBy: supplierId, quantity: 0 }),
      
      // Processing orders count
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, status: 'processing' }),

      // Delivered orders count
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, status: 'delivered' }),
      
      // Payment failed orders count
      Order.countDocuments({ 'items.rawMaterial': { $in: supplierRawMaterialIds }, paymentStatus: 'failed' })
    ]);

    // Calculate additional metrics
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Recent activity (last 10 activities)
    const recentActivity = [];
    
    // Add recent orders to activity
    const recentOrdersActivity = recentOrders.map(order => ({
      type: 'order',
      description: `New order ₹${order.totalAmount.toLocaleString()} from ${order.user?.vendorName || 'Unknown Vendor'}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    // Add recent raw materials to activity
    const recentRawMaterialsActivity = recentRawMaterials.map(material => ({
      type: 'rawmaterial',
      description: `New raw material "${material.name}" added to ${material.category}`,
      timestamp: material.createdAt,
      status: 'active'
    }));
    
    // Combine and sort activities
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
