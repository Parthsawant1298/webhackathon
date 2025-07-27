// app/api/supplier/orders/route.js
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

    // Get query parameters for filtering and pagination
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

    // Build filter query, ensuring orders contain supplier's materials
    const filter = {
      'items.rawMaterial': { $in: supplierRawMaterialIds }
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // For search, we'll need to search in user (vendor) details
    let userFilter = {};
    if (search) {
      userFilter = {
        $or: [
          { 'userDetails.vendorName': { $regex: search, $options: 'i' } },
          { 'userDetails.email': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [
      // Initial match for orders containing the supplier's raw materials
      { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
      // Lookup user (vendor) details
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      // Lookup raw material details for items
      {
        $lookup: {
          from: 'rawmaterials',
          localField: 'items.rawMaterial',
          foreignField: '_id',
          as: 'rawMaterialDetails'
        }
      },
      // Add raw material details to items
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    rawMaterialDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$rawMaterialDetails',
                            cond: { $eq: ['$$this._id', '$$item.rawMaterial'] }
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
      },
      // Apply filters
      {
        $match: {
          ...filter,
          ...(search ? userFilter : {})
        }
      },
      // Sort
      {
        $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      },
      // Add pagination info
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
    ];

    const [result] = await Order.aggregate(pipeline);
    const orders = result.orders || [];
    const totalCount = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get order statistics for the supplier
    const stats = await Order.aggregate([
      { $match: { 'items.rawMaterial': { $in: supplierRawMaterialIds } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'completed'] },
                '$totalAmount',
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
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        paymentFailedOrders: 0
      }
    });

  } catch (error) {
    console.error('Supplier orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

// Update order status
export async function PUT(request) {
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

    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Validate status values
    const allowedStatuses = ['processing', 'delivered', 'payment failed'];
    const allowedPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    // Find and update the order
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedAt = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'vendorName email');

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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
