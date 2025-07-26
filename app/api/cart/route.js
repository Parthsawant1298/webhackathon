// /api/cart/route.js - Only for Raw Materials
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import RawMaterial from '@/models/rawMaterial';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get('user-session')?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse user session
    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie);
    } catch (parseError) {
      console.error('Failed to parse user session:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = userSession.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session data' },
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

    // Find or create cart for user
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(cartItem => 
      cartItem.rawMaterialId && cartItem.rawMaterialId.toString() === rawMaterialId
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
      // Add new item to cart
      const cartItem = {
        rawMaterialId: rawMaterialId,
        quantity,
        price: rawMaterial.price
      };

      cart.items.push(cartItem);
    }

    // Update cart totals
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Raw material added to cart successfully',
      cart: {
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length
      }
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
    
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get('user-session')?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse user session
    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie);
    } catch (parseError) {
      console.error('Failed to parse user session:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = userSession.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session data' },
        { status: 401 }
      );
    }

    // Find cart and populate items
    const cart = await Cart.findOne({ userId })
      .populate('items.rawMaterialId', 'name price mainImage quantity')
      .lean();

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          totalQuantity: 0,
          totalAmount: 0
        }
      });
    }

    // Filter out items where the referenced raw material no longer exists
    const validItems = cart.items.filter(item => item.rawMaterialId !== null);

    // Recalculate totals
    const totalQuantity = validItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validItems,
        totalQuantity,
        totalAmount
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
    const userSessionCookie = cookieStore.get('user-session')?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse user session
    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie);
    } catch (parseError) {
      console.error('Failed to parse user session:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = userSession.id;
    const { itemId, quantity } = await request.json();

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid item ID and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Check availability
    const cartItem = cart.items[itemIndex];
    let availableQuantity = 0;

    if (cartItem.rawMaterialId) {
      const rawMaterial = await RawMaterial.findById(cartItem.rawMaterialId);
      availableQuantity = rawMaterial ? rawMaterial.quantity : 0;
    }

    if (quantity > availableQuantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient quantity available' },
        { status: 400 }
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      cart: {
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
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
    const userSessionCookie = cookieStore.get('user-session')?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse user session
    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie);
    } catch (parseError) {
      console.error('Failed to parse user session:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = userSession.id;
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
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