// app/api/supplier/analytics/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import RawMaterial from '@/models/rawMaterial';
import User from '@/models/user';
import Supplier from '@/models/supplier';
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

    // Get query parameters for time range
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '12months';

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Define time range filters
    let startDate;
    switch (timeRange) {
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '12months':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case 'thisyear':
        startDate = thisYear;
        break;
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }

    // Get all raw material IDs for the current supplier
    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId, isActive: true }).select('_id').lean();
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    if (supplierRawMaterialIds.length === 0) {
      // Return default empty analytics if no raw materials
      return NextResponse.json({
        success: true,
        timeRange,
        data: {
          dailyRevenue: [],
          monthlyRevenue: [],
          categoryRevenue: [],
          productRevenue: [],
          vendorAnalytics: [],
          paymentAnalysis: [],
          orderSizeAnalysis: [],
          topVendors: [],
          growth: { revenue: 0, orders: 0, vendors: 0 },
          summary: {
            today: { revenue: 0, orders: 0 },
            thisMonth: { revenue: 0, orders: 0 },
            thisYear: { revenue: 0, orders: 0 },
            allTime: { revenue: 0, orders: 0 }
          }
        }
      });
    }

    // Base match for orders containing the supplier's raw materials
    const baseOrderMatch = {
      'items.rawMaterial': { $in: supplierRawMaterialIds },
      paymentStatus: 'completed',
      createdAt: { $gte: startDate }
    };

    // Parallel execution of all analytics queries
    const [
      dailyRevenue,
      monthlyRevenue,
      categoryRevenue,
      productRevenue,
      vendorAnalytics,
      paymentAnalysis,
      orderSizeAnalysis,
      growthMetrics,
      topVendors,
      revenueSummary
    ] = await Promise.all([
      
      // 1. Daily Revenue Trends
      Order.aggregate([
        { $match: { ...baseOrderMatch, createdAt: { $gte: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) } } },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderIds: { $addToSet: '$_id' }
          }
        },
        { $addFields: { orders: { $size: '$orderIds' } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 90 }
      ]),
      
      // 2. Monthly Revenue Trends
      Order.aggregate([
        { $match: { ...baseOrderMatch, createdAt: { $gte: new Date(now.getFullYear() - 2, 0, 1) } } },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderIds: { $addToSet: '$_id' },
            vendors: { $addToSet: '$user' }
          }
        },
        { 
          $addFields: { 
            uniqueVendors: { $size: '$vendors' }, 
            orders: { $size: '$orderIds' } 
          } 
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // 3. Revenue by Category
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $lookup: {
            from: 'rawmaterials',
            localField: 'items.rawMaterial',
            foreignField: '_id',
            as: 'rawMaterialDetails'
          }
        },
        { $unwind: '$rawMaterialDetails' },
        {
          $group: {
            _id: '$rawMaterialDetails.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' },
            orderIds: { $addToSet: '$_id' }
          }
        },
        { $addFields: { orders: { $size: '$orderIds' } } },
        { $sort: { revenue: -1 } }
      ]),
      
      // 4. Top Raw Materials by Revenue
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$items.rawMaterial',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantitySold: { $sum: '$items.quantity' },
            orderIds: { $addToSet: '$_id' }
          }
        },
        {
          $lookup: {
            from: 'rawmaterials',
            localField: '_id',
            foreignField: '_id',
            as: 'rawMaterialDetails'
          }
        },
        { $unwind: '$rawMaterialDetails' },
        {
          $project: {
            productName: '$rawMaterialDetails.name',
            category: '$rawMaterialDetails.category',
            revenue: 1,
            quantitySold: 1,
            orders: { $size: '$orderIds' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      
      // 5. Vendor Analytics
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderIds: { $addToSet: '$_id' }
          }
        },
        { $addFields: { orderCount: { $size: '$orderIds' } } },
        {
          $bucket: {
            groupBy: '$totalSpent',
            boundaries: [0, 1000, 5000, 10000, 25000, 50000, 100000, Infinity],
            default: 'Other',
            output: {
              vendors: { $sum: 1 },
              totalRevenue: { $sum: '$totalSpent' },
              avgSpent: { $avg: '$totalSpent' }
            }
          }
        }
      ]),
      
      // 6. Payment Method Analysis
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$_id',
            totalAmount: { $first: '$totalAmount' },
            paymentInfo: { $first: '$paymentInfo' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: ['$paymentInfo.razorpayPaymentId', null] },
                'Online Payment',
                'Other'
              ]
            },
            revenue: { $sum: '$revenue' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$revenue' }
          }
        }
      ]),
      
      // 7. Order Size Analysis
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$_id',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $addFields: {
            orderSize: {
              $switch: {
                branches: [
                  { case: { $lt: ['$revenue', 500] }, then: '₹0-500' },
                  { case: { $lt: ['$revenue', 1000] }, then: '₹500-1,000' },
                  { case: { $lt: ['$revenue', 2500] }, then: '₹1,000-2,500' },
                  { case: { $lt: ['$revenue', 5000] }, then: '₹2,500-5,000' },
                  { case: { $lt: ['$revenue', 10000] }, then: '₹5,000-10,000' }
                ],
                default: '₹10,000+'
              }
            }
          }
        },
        {
          $group: {
            _id: '$orderSize',
            orders: { $sum: 1 },
            revenue: { $sum: '$revenue' },
            avgOrderValue: { $avg: '$revenue' }
          }
        },
        { $sort: { avgOrderValue: 1 } }
      ]),
      
      // 8. Growth Metrics (Current vs Previous Period)
      Order.aggregate([
        {
          $match: {
            'items.rawMaterial': { $in: supplierRawMaterialIds },
            paymentStatus: 'completed',
            createdAt: { $gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())) }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: {
              period: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  'current',
                  'previous'
                ]
              }
            },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderIds: { $addToSet: '$_id' },
            vendors: { $addToSet: '$user' }
          }
        },
        {
          $addFields: {
            uniqueVendors: { $size: '$vendors' },
            orders: { $size: '$orderIds' }
          }
        }
      ]),
      
      // 9. Top Vendors
      Order.aggregate([
        { $match: baseOrderMatch },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderIds: { $addToSet: '$_id' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        { $addFields: { orderCount: { $size: '$orderIds' } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'vendorDetails'
          }
        },
        { $unwind: '$vendorDetails' },
        {
          $project: {
            vendorName: '$vendorDetails.vendorName',
            vendorEmail: '$vendorDetails.email',
            totalSpent: 1,
            orderCount: 1,
            lastOrder: 1
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]),
      
      // 10. Revenue Summary
      Order.aggregate([
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds }, paymentStatus: 'completed' } },
        { $unwind: '$items' },
        { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
        {
          $group: {
            _id: '$_id',
            createdAt: { $first: '$createdAt' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $facet: {
            today: [
              { $match: { createdAt: { $gte: today } } },
              { $group: { _id: null, revenue: { $sum: '$revenue' }, orders: { $sum: 1 } } }
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: thisMonth } } },
              { $group: { _id: null, revenue: { $sum: '$revenue' }, orders: { $sum: 1 } } }
            ],
            thisYear: [
              { $match: { createdAt: { $gte: thisYear } } },
              { $group: { _id: null, revenue: { $sum: '$revenue' }, orders: { $sum: 1 } } }
            ],
            allTime: [
              { $group: { _id: null, revenue: { $sum: '$revenue' }, orders: { $sum: 1 } } }
            ]
          }
        }
      ])
    ]);

    // Calculate growth percentages
    const currentPeriod = growthMetrics.find(g => g._id.period === 'current') || { revenue: 0, orders: 0, uniqueVendors: 0 };
    const previousPeriod = growthMetrics.find(g => g._id.period === 'previous') || { revenue: 0, orders: 0, uniqueVendors: 0 };
    
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const growth = {
      revenue: calculateGrowth(currentPeriod.revenue, previousPeriod.revenue),
      orders: calculateGrowth(currentPeriod.orders, previousPeriod.orders),
      vendors: calculateGrowth(currentPeriod.uniqueVendors, previousPeriod.uniqueVendors)
    };

    // Process revenue summary
    const summary = {
      today: revenueSummary[0]?.today[0] || { revenue: 0, orders: 0 },
      thisMonth: revenueSummary[0]?.thisMonth[0] || { revenue: 0, orders: 0 },
      thisYear: revenueSummary[0]?.thisYear[0] || { revenue: 0, orders: 0 },
      allTime: revenueSummary[0]?.allTime[0] || { revenue: 0, orders: 0 }
    };

    return NextResponse.json({
      success: true,
      timeRange,
      data: {
        dailyRevenue,
        monthlyRevenue,
        categoryRevenue,
        productRevenue,
        vendorAnalytics,
        paymentAnalysis,
        orderSizeAnalysis,
        topVendors,
        growth,
        summary
      }
    });

  } catch (error) {
    console.error('Supplier analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier analytics', details: error.message },
      { status: 500 }
    );
  }
}