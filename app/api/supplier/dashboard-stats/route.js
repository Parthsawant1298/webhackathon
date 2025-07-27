// app/api/supplier/dashboard-stats/route.js - FIXED VERSION
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

    // Get all raw materials for this supplier
    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId }).select('_id').lean();
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    if (supplierRawMaterialIds.length === 0) {
      // Return default stats if no raw materials
      return NextResponse.json({
        success: true,
        stats: {
          totalRawMaterials: 0,
          totalVendors: 0,
          totalOrders: 0,
          totalRevenue: 0,
          lowStockRawMaterials: 0,
          outOfStockRawMaterials: 0,
          processingOrders: 0,
          deliveredOrders: 0,
          paymentFailedOrders: 0,
        },
        recentRawMaterials: [],
        recentOrders: [],
        recentActivity: [],
        categoryStats: [],
        monthlyRevenue: [],
        insights: {
          averageOrderValue: 0,
          conversionRate: 0,
          topCategory: "No raw materials yet",
        }
      });
    }

    const [
      totalRawMaterials,
      revenueData,
      recentRawMaterials,
      recentOrders,
      categoryStats,
      monthlyRevenue,
      lowStockRawMaterialsCount,
      outOfStockRawMaterialsCount,
      processingOrdersCount,
      deliveredOrdersCount,
      paymentFailedOrdersCount,
      totalVendors
    ] = await Promise.all([
      // Total raw materials
      RawMaterial.countDocuments({ createdBy: supplierId, isActive: true }),
      
      // Total revenue from completed orders
      Order.aggregate([
        { 
          $match: { 
            'items.rawMaterial': { $in: supplierRawMaterialIds }, 
            paymentStatus: 'completed' 
          } 
        },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            totalOrders: { $addToSet: '$_id' }
          } 
        },
        {
          $project: {
            totalRevenue: 1,
            totalOrders: { $size: '$totalOrders' }
          }
        }
      ]),
      
      // Recent raw materials
      RawMaterial.find({ createdBy: supplierId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category subcategory price quantity createdAt mainImage')
        .lean(),
      
      // Recent orders containing supplier's materials
      Order.find({ 'items.rawMaterial': { $in: supplierRawMaterialIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'vendorName email')
        .select('totalAmount status paymentStatus createdAt user items')
        .lean(),
      
      // Category statistics
      RawMaterial.aggregate([
        { $match: { createdBy: supplierId, isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Monthly revenue for last 6 months
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
      
      // Low stock materials (≤5 items)
      RawMaterial.countDocuments({ 
        createdBy: supplierId, 
        isActive: true,
        quantity: { $lte: 5, $gt: 0 } 
      }),
      
      // Out of stock materials
      RawMaterial.countDocuments({ 
        createdBy: supplierId, 
        isActive: true,
        quantity: 0 
      }),
      
      // Processing orders
      Order.countDocuments({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds }, 
        status: 'processing' 
      }),

      // Delivered orders
      Order.countDocuments({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds }, 
        status: 'delivered' 
      }),
      
      // Payment failed orders
      Order.countDocuments({ 
        'items.rawMaterial': { $in: supplierRawMaterialIds }, 
        paymentStatus: 'failed' 
      }),

      // Total unique vendors who ordered from this supplier
      Order.distinct('user', { 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        paymentStatus: 'completed'
      })
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const totalOrders = revenueData.length > 0 ? revenueData[0].totalOrders : 0;
    
    // Create recent activity from materials and orders
    const recentActivity = [];
    
    // Add recent orders to activity
    const recentOrdersActivity = recentOrders.map(order => ({
      type: 'order',
      description: `New order ₹${order.totalAmount.toLocaleString()} from ${order.user?.vendorName || 'Unknown Vendor'}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    // Add recent materials to activity
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