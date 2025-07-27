// app/api/supplier/orders/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import User from '@/models/user';
import Supplier from '@/models/supplier';
import RawMaterial from '@/models/rawMaterial';
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

    // Get all raw material IDs for this supplier
    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId }).select('_id');
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    if (supplierRawMaterialIds.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          processingOrders: 0,
          deliveredOrders: 0,
          paymentFailedOrders: 0
        }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Build filter for orders containing supplier's raw materials
    const baseFilter = {
      'items.rawMaterial': { $in: supplierRawMaterialIds }
    };
    
    if (status && status !== 'all') {
      baseFilter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      baseFilter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      baseFilter.createdAt = {};
      if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
      if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    // Pipeline for aggregating orders with user search
    let pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userDetails.vendorName': { $regex: search, $options: 'i' } },
            { 'userDetails.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add lookup for raw materials to get details
    pipeline.push({
      $lookup: {
        from: 'rawmaterials',
        localField: 'items.rawMaterial',
        foreignField: '_id',
        as: 'rawMaterialDetails'
      }
    });

    // Process items to include raw material details
    pipeline.push({
      $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$item',
                {
                  rawMaterial: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$rawMaterialDetails',
                          cond: { $eq: ['$this._id', '$item.rawMaterial'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    });

    // Remove the temporary rawMaterialDetails field
    pipeline.push({
      $project: {
        rawMaterialDetails: 0
      }
    });

    // Sort
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Execute pipeline with pagination
    const [ordersResult] = await Order.aggregate([
      ...pipeline,
      {
        $facet: {
          orders: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const orders = ordersResult.orders || [];
    const totalCount = ordersResult.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate stats for supplier's portion of orders
    const statsResult = await Order.aggregate([
      { $match: baseFilter },
      { $unwind: '$items' },
      { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
      {
        $group: {
          _id: '$_id',
          status: { $first: '$status' },
          paymentStatus: { $first: '$paymentStatus' },
          supplierRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'completed'] },
                '$supplierRevenue',
                0
              ]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          paymentFailedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'payment failed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = statsResult[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      paymentFailedOrders: 0
    };

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Supplier orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const allowedStatuses = ['processing', 'delivered', 'payment failed'];
    const allowedPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    // Verify this order contains supplier's raw materials
    const supplierRawMaterials = await RawMaterial.find({ createdBy: supplierId }).select('_id');
    const supplierRawMaterialIds = supplierRawMaterials.map(rm => rm._id);

    const order = await Order.findOne({
      _id: orderId,
      'items.rawMaterial': { $in: supplierRawMaterialIds }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedAt = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'vendorName email');

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    );
  }
}