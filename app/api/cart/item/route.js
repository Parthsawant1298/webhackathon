// app/api/cart/item/route.js - FINAL CORRECTED VERSION
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import RawMaterial from '@/models/rawMaterial';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Update cart item quantity
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { rawMaterialId, quantity } = await request.json();
    
    if (!rawMaterialId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if raw material exists and has enough stock
    const rawMaterial = await RawMaterial.findById(rawMaterialId);
    if (!rawMaterial) {
      return NextResponse.json(
        { error: 'Raw material not found' },
        { status: 404 }
      );
    }
    
    // Check actual available quantity
    if (rawMaterial.quantity < quantity) {
      return NextResponse.json(
        { 
          error: `Only ${rawMaterial.quantity} items available in stock`,
          availableQuantity: rawMaterial.quantity 
        },
        { status: 400 }
      );
    }
    
    // Find user's cart - FIXED: Use correct field name 'user'
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Find the item in the cart - FIXED: Use correct field name 'rawMaterial'
    const itemIndex = cart.items.findIndex(item => 
      item.rawMaterial.toString() === rawMaterialId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }
    
    // Update the quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Get updated cart with raw material details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.rawMaterial',
        select: 'name price mainImage quantity'
      });
      
    // Calculate total
    let totalPrice = 0;
    updatedCart.items.forEach(item => {
      if (item.rawMaterial && item.rawMaterial.price) {
        totalPrice += item.rawMaterial.price * item.quantity;
      }
    });
    
    // Add availability information to each item
    const itemsWithAvailability = updatedCart.items.map(item => {
      if (!item.rawMaterial) return item;
      
      return {
        ...item.toObject ? item.toObject() : item,
        availableQuantity: item.rawMaterial.quantity,
        hasStockIssue: item.quantity > item.rawMaterial.quantity
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        _id: updatedCart._id,
        items: itemsWithAvailability,
        totalItems: updatedCart.items.length,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { rawMaterialId } = await request.json();
    
    if (!rawMaterialId) {
      return NextResponse.json(
        { error: 'Raw Material ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user's cart - FIXED: Use correct field name 'user'
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Remove the item from the cart - FIXED: Use correct field name 'rawMaterial'
    cart.items = cart.items.filter(item => 
      item.rawMaterial.toString() !== rawMaterialId
    );
    
    await cart.save();
    
    // Get updated cart with raw material details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.rawMaterial',
        select: 'name price mainImage quantity'
      });
      
    // Calculate total
    let totalPrice = 0;
    updatedCart.items.forEach(item => {
      if (item.rawMaterial && item.rawMaterial.price) {
        totalPrice += item.rawMaterial.price * item.quantity;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        totalItems: updatedCart.items.length,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: error.message },
      { status: 500 }
    );
  }
}