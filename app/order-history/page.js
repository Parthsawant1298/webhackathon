// app/order-history/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, AlertCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch('/api/order/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }
        
        const data = await response.json();
        setOrders(data.orders);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Determine order status color and icon
  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'processing':
        return { 
          color: 'text-blue-500', 
          icon: <Package className="mr-1 sm:mr-2" size={16} /> 
        };
      case 'delivered':
        return { 
          color: 'text-green-500', 
          icon: <CheckCircle className="mr-1 sm:mr-2" size={16} /> 
        };
      case 'payment failed':
        return { 
          color: 'text-red-500', 
          icon: <XCircle className="mr-1 sm:mr-2" size={16} /> 
        };
      default:
        return { 
          color: 'text-gray-500', 
          icon: <Package className="mr-1 sm:mr-2" size={16} /> 
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-md rounded-lg animate-pulse p-3 sm:p-6">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-4 sm:mb-6"></div>
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8 flex items-center justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center mx-2">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Unable to Fetch Orders</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8 flex items-center justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center mx-2">
            <Package className="mx-auto mb-4 text-gray-400" size={40} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping and your order history will appear here.
            </p>
            <Link 
              href="/rawmaterials"
              className="inline-block w-full sm:w-auto px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              Browse Raw Materials
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="text-teal-600 hover:text-teal-800 transition-colors flex items-center text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="mr-1 sm:mr-2"/>
            Back to Main
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-teal-600 text-white px-3 sm:px-6 py-3 sm:py-4">
              <h1 className="text-xl sm:text-2xl font-bold">Order History</h1>
              <p className="text-teal-100 text-sm sm:text-base mt-1">Review your past orders and their current status</p>
            </div>

            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-500 break-all">Order ID: {order._id}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`flex items-center ${getOrderStatusStyle(order.status).color} self-start sm:self-auto`}>
                      {getOrderStatusStyle(order.status).icon}
                      <span className="capitalize text-sm sm:text-base">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {order.items.map((item) => {
                      // Add null check for rawMaterial
                      if (!item.rawMaterial) {
                        return (
                          <div 
                            key={item._id} 
                            className="flex items-center space-x-2 sm:space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors text-gray-500 text-sm sm:text-base"
                          >
                            Raw Material Unavailable
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={item._id} 
                          className="flex items-center space-x-2 sm:space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        >
                          <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0">
                            <Image 
                              src={item.rawMaterial.mainImage || '/default-rawmaterial-image.png'} 
                              alt={item.rawMaterial.name || 'Raw Material'}
                              fill
                              className="object-cover rounded-md"
                              sizes="(max-width: 640px) 56px, 80px"
                              onError={(e) => {
                                e.target.src = '/default-rawmaterial-image.png';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {item.rawMaterial.name || 'Unnamed Raw Material'}
                            </h3>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span>Quantity: {item.quantity}</span>
                                <span className="hidden sm:inline">|</span>
                                <span>Price: {formatCurrency(item.price)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t pt-3 sm:pt-4 gap-2">
                    <p className="text-gray-600 text-sm sm:text-base">Total Amount</p>
                    <p className="text-lg sm:text-xl font-bold text-teal-600">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>

                  <Link 
                    href={`/order/${order._id}`} 
                    className="mt-3 sm:mt-4 w-full flex items-center justify-center text-teal-600 hover:text-teal-800 transition-colors text-sm sm:text-base py-2 sm:py-0"
                  >
                    View Order Details
                    <ChevronRight size={16} className="ml-1 sm:ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}