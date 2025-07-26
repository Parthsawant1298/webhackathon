// app/api/cart/route.js - FINAL CORRECTED VERSION
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import RawMaterial from '@/models/rawMaterial';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get user session from cookies - FIXED: Use userId cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { rawMaterialId, quantity } = await request.json();

    // Validation
    if (!rawMaterialId) {
      return NextResponse.json(
        { success: false, error: 'Raw Material ID is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Find raw material
    const rawMaterial = await RawMaterial.findById(rawMaterialId);
    
    if (!rawMaterial) {
      return NextResponse.json(
        { success: false, error: 'Raw material not found' },
        { status: 404 }
      );
    }

    // Check availability
    if (rawMaterial.quantity < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient quantity available' },
        { status: 400 }
      );
    }

    // Find or create cart for user - FIXED: Use correct field name 'user'
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId, // FIXED: Use 'user' not 'userId'
        items: []
      });
    }

    // Check if item already exists in cart - FIXED: Use correct field name 'rawMaterial'
    const existingItemIndex = cart.items.findIndex(cartItem => 
      cartItem.rawMaterial && cartItem.rawMaterial.toString() === rawMaterialId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check if new quantity exceeds available stock
      if (newQuantity > rawMaterial.quantity) {
        return NextResponse.json(
          { success: false, error: 'Cannot add more items than available in stock' },
          { status: 400 }
        );
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart - FIXED: Use correct field name 'rawMaterial'
      cart.items.push({
        rawMaterial: rawMaterialId, // FIXED: Use 'rawMaterial' not 'rawMaterialId'
        quantity
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Raw material added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add item to cart',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    // Get user session from cookies - FIXED: Use userId cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find cart and populate items - FIXED: Use correct field names
    const cart = await Cart.findOne({ user: userId })
      .populate('items.rawMaterial', 'name price mainImage quantity')
      .lean();

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          totalQuantity: 0,
          totalPrice: 0
        }
      });
    }

    // Filter out items where the referenced raw material no longer exists
    const validItems = cart.items.filter(item => item.rawMaterial !== null);

    // Calculate totals
    let totalPrice = 0;
    validItems.forEach(item => {
      if (item.rawMaterial && item.rawMaterial.price) {
        totalPrice += item.rawMaterial.price * item.quantity;
      }
    });

    // Add availability information to each item
    const itemsWithAvailability = validItems.map(item => {
      if (!item.rawMaterial) return item;
      
      return {
        ...item,
        availableQuantity: item.rawMaterial.quantity,
        hasStockIssue: item.quantity > item.rawMaterial.quantity
      };
    });

    return NextResponse.json({
      success: true,
      cart: {
        _id: cart._id,
        items: itemsWithAvailability,
        totalItems: validItems.length,
        totalPrice
      }
    });

  } catch (error) {
    console.error('Fetch cart error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cart',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    // Get user session from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { rawMaterialId, quantity } = await request.json();

    if (!rawMaterialId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid raw material ID and quantity are required' },
        { status: 400 }
      );
    }

    // Find cart - FIXED: Use correct field name
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find the item in the cart - FIXED: Use correct field name
    const itemIndex = cart.items.findIndex(item => 
      item.rawMaterial.toString() === rawMaterialId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Check availability
    const rawMaterial = await RawMaterial.findById(rawMaterialId);
    if (!rawMaterial || quantity > rawMaterial.quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient quantity available' },
        { status: 400 }
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update cart item',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get user session from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { rawMaterialId } = await request.json();

    if (!rawMaterialId) {
      return NextResponse.json(
        { success: false, error: 'Raw Material ID is required' },
        { status: 400 }
      );
    }

    // Find cart - FIXED: Use correct field name
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove item from cart - FIXED: Use correct field name
    cart.items = cart.items.filter(item => 
      item.rawMaterial.toString() !== rawMaterialId
    );

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove item from cart',
        details: error.message 
      },
      { status: 500 }
    );
  }
}