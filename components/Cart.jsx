// components/Cart.jsx
"use client";

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cart');
      }

      setCart(data.cart);
    } catch (error) {
      console.error('Fetch cart error:', error);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (rawMaterialId, newQuantity) => {
    try {
      const response = await fetch('/api/cart/item', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawMaterialId,
          quantity: newQuantity
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cart');
      }

      setCart(data.cart);
      showToast('Cart updated successfully!', 'success');
    } catch (error) {
      console.error('Update cart error:', error);
      showToast(error.message || 'Failed to update cart', 'error');
    }
  };

  const removeCartItem = async (rawMaterialId) => {
    try {
      const response = await fetch('/api/cart/item', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawMaterialId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item');
      }

      setCart(data.cart);
      showToast('Item removed from cart!', 'success');
    } catch (error) {
      console.error('Remove cart item error:', error);
      showToast(error.message || 'Failed to remove item', 'error');
    }
  };

  // Toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up ${
      type === 'success' ? 'bg-teal-600' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-teal-700 animate-pulse">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white py-8">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => router.push('/rawmaterials')}
            className="mb-6 flex items-center text-teal-600 hover:text-teal-800 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Continue Shopping</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
            
            {error && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}
            
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <ShoppingBag size={64} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added any raw materials to your cart yet.</p>
                <button
                  onClick={() => router.push('/rawmaterials')}
                  className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Browse Raw Materials
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-4 mb-4 hidden md:flex">
                  <div className="w-1/2 font-semibold text-gray-700">Raw Material</div>
                  <div className="w-1/6 font-semibold text-gray-700 text-center">Price</div>
                  <div className="w-1/6 font-semibold text-gray-700 text-center">Quantity</div>
                  <div className="w-1/6 font-semibold text-gray-700 text-center">Total</div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {cart.items.map((item) => {
                    const maxAvailable = item.availableQuantity || item.quantity;
                    const hasStockIssue = item.hasStockIssue || false;
                    
                    return (
                      <div key={item.rawMaterial._id} className="py-4 border-b border-gray-100 flex flex-col md:flex-row items-center">
                        {/* Raw Material */}
                        <div className="w-full md:w-1/2 flex items-center mb-4 md:mb-0">
                          <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden mr-4">
                            <img 
                              src={item.rawMaterial.mainImage || "/placeholder.svg"} 
                              alt={item.rawMaterial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{item.rawMaterial.name}</h3>
                            <button
                              onClick={() => removeCartItem(item.rawMaterial._id)}
                              className="text-red-500 text-sm flex items-center mt-1 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </button>
                            
                            {hasStockIssue && (
                              <p className="text-red-500 text-xs mt-1">
                                Only {maxAvailable} item(s) available now
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="w-full md:w-1/6 flex justify-between md:justify-center items-center mb-2 md:mb-0">
                          <span className="md:hidden text-gray-600">Price:</span>
                          <span className="font-medium">₹{item.rawMaterial.price.toLocaleString()}</span>
                        </div>
                        
                        {/* Quantity */}
                        <div className="w-full md:w-1/6 flex justify-between md:justify-center items-center mb-2 md:mb-0">
                          <span className="md:hidden text-gray-600">Quantity:</span>
                          <div className="flex items-center">
                            <button 
                              onClick={() => updateCartItem(item.rawMaterial._id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className={`w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 ${
                              hasStockIssue ? 'bg-red-50 text-red-500' : 'bg-gray-50'
                            }`}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartItem(item.rawMaterial._id, Math.min(maxAvailable, item.quantity + 1))}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-100 transition-colors"
                              disabled={item.quantity >= maxAvailable}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Total */}
                        <div className="w-full md:w-1/6 flex justify-between md:justify-center items-center">
                          <span className="md:hidden text-gray-600">Total:</span>
                          <span className="font-semibold">₹{(item.rawMaterial.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="md:w-1/2 mb-6 md:mb-0">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{cart.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">₹0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">Included</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold">₹{cart.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3 flex flex-col">
                    <button 
                      onClick={() => router.push('/checkout')}
                      className="py-3 px-6 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors mb-2"
                    >
                      Proceed to Checkout
                    </button>
                    <button 
                      onClick={() => router.push('/rawmaterials')}
                      className="py-3 px-6 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
