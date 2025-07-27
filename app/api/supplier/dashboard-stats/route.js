// app/api/supplier/dashboard-stats/route.js - COMPLETE FIXED VERSION
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
    console.log('🚀 Dashboard stats API called');
    
    // Check supplier authentication
    const cookieStore = await cookies();
    const supplierSessionCookie = cookieStore.get('supplier-session')?.value;
    
    console.log('🔐 Checking authentication...', !!supplierSessionCookie);
    
    if (!supplierSessionCookie) {
      console.log('❌ No supplier session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supplierSession = JSON.parse(supplierSessionCookie);
    const supplierId = new mongoose.Types.ObjectId(supplierSession.id);
    
    console.log('👤 Supplier ID:', supplierId);

    await connectDB();
    
    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      console.log('❌ Supplier not found in database');
      return NextResponse.json({ error: 'Supplier not found' }, { status: 403 });
    }
    
    console.log('✅ Supplier found:', supplier.supplierName);

    // Get all raw materials for this supplier
    const supplierRawMaterials = await RawMaterial.find({ 
      createdBy: supplierId,
      isActive: true 
    }).select('_id name category subcategory price quantity mainImage createdAt').lean();
    
    console.log('📦 Raw materials found:', supplierRawMaterials.length);
    
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    if (supplierRawMaterialIds.length === 0) {
      console.log('📭 No raw materials found, returning empty stats');
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

    console.log('🔍 Querying orders for materials:', supplierRawMaterialIds.length);

    // Execute all queries in parallel for better performance
    const [
      totalRawMaterials,
      revenueData,
      recentOrders,
      categoryStats,
      monthlyRevenue,
      lowStockCount,
      outOfStockCount,
      statusCounts,
      totalVendors
    ] = await Promise.all([
      // 1. Total raw materials count
      RawMaterial.countDocuments({ createdBy: supplierId, isActive: true }),
      
      // 2. Revenue data from completed orders
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
            orderIds: { $addToSet: '$_id' }
          } 
        },
        {
          $project: {
            totalRevenue: 1,
            totalOrders: { $size: '$orderIds' }
          }
        }
      ]),
      
      // 3. Recent orders containing supplier's materials
      Order.find({ 'items.rawMaterial': { $in: supplierRawMaterialIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'vendorName email')
        .select('totalAmount status paymentStatus createdAt user items')
        .lean(),
      
      // 4. Category statistics
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
      
      // 5. Monthly revenue for last 6 months
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
            orderIds: { $addToSet: '$_id' }
          }
        },
        { $addFields: { orderCount: { $size: '$orderIds' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // 6. Low stock materials (≤5 items)
      RawMaterial.countDocuments({ 
        createdBy: supplierId, 
        isActive: true,
        quantity: { $lte: 5, $gt: 0 } 
      }),
      
      // 7. Out of stock materials
      RawMaterial.countDocuments({ 
        createdBy: supplierId, 
        isActive: true,
        quantity: 0 
      }),
      
      // 8. Order status counts
      Order.aggregate([
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // 9. Total unique vendors who ordered from this supplier
      Order.distinct('user', { 
        'items.rawMaterial': { $in: supplierRawMaterialIds },
        paymentStatus: 'completed'
      })
    ]);

    console.log('📊 Query results:');
    console.log('- Total materials:', totalRawMaterials);
    console.log('- Revenue data:', revenueData);
    console.log('- Recent orders:', recentOrders.length);
    console.log('- Total vendors:', totalVendors.length);

    // Process revenue data
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const totalOrders = revenueData.length > 0 ? revenueData[0].totalOrders : 0;
    
    // Process status counts
    const processingOrders = statusCounts.find(s => s._id === 'processing')?.count || 0;
    const deliveredOrders = statusCounts.find(s => s._id === 'delivered')?.count || 0;
    const paymentFailedOrders = statusCounts.find(s => s._id === 'payment failed')?.count || 0;
    
    // Create recent activity from materials and orders
    const recentActivity = [];
    
    // Add recent orders to activity
    const recentOrdersActivity = recentOrders.map(order => ({
      type: 'order',
      description: `New order ₹${order.totalAmount.toLocaleString()} from ${order.user?.vendorName || 'Unknown Vendor'}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    // Add recent materials to activity (get latest 5 materials)
    const recentMaterials = supplierRawMaterials
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
      
    const recentRawMaterialsActivity = recentMaterials.map(material => ({
      type: 'rawmaterial',
      description: `Added raw material "${material.name}" to ${material.category}`,
      timestamp: material.createdAt,
      status: 'active'
    }));
    
    recentActivity.push(...recentOrdersActivity, ...recentRawMaterialsActivity);
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const stats = {
      totalRawMaterials,
      totalVendors: totalVendors.length,
      totalOrders,
      totalRevenue,
      lowStockRawMaterials: lowStockCount,
      outOfStockRawMaterials: outOfStockCount,
      processingOrders,
      deliveredOrders,
      paymentFailedOrders
    };

    const insights = {
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      conversionRate: totalVendors.length > 0 ? Math.round((totalOrders / totalVendors.length) * 100) : 0,
      topCategory: categoryStats.length > 0 ? categoryStats[0]._id : 'No raw materials yet'
    };

    console.log('✅ Sending dashboard data:', {
      statsKeys: Object.keys(stats),
      totalRevenue,
      totalOrders,
      materialsCount: totalRawMaterials
    });

    return NextResponse.json({
      success: true,
      stats,
      recentRawMaterials: supplierRawMaterials.slice(0, 5),
      recentOrders,
      recentActivity: recentActivity.slice(0, 10),
      categoryStats,
      monthlyRevenue,
      insights
    });

  } catch (error) {
    console.error('❌ Supplier dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}