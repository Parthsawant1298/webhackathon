// app/payment-success/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch('/api/order/recent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrderDetails(data.order);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  // Calculate estimated delivery date (3-5 business days from now)
  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 3) + 3; // Random number between 3-5
    let businessDays = 0;
    let deliveryDate = new Date(today);
    
    while (businessDays < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDays++;
      }
    }
    
    return deliveryDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto mb-4 text-teal-600 animate-pulse" />
            <p className="text-xl text-gray-600">Processing your order...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !orderDetails) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <div className="mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Retrieval Error</h2>
            <p className="text-gray-600 mb-6">
              We couldn't retrieve your order details at the moment. 
              Please contact support or check your account for recent orders.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/rawmaterials"
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link 
                href="/order-history"
                className="px-6 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors flex items-center"
              >
                View Orders
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-white text-center">
              <CheckCircle size={64} className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-teal-100 text-lg">Your raw materials order has been placed successfully</p>
            </div>
            
            {/* Order Details */}
            <div className="p-8">
              <div className="mb-6 text-center">
                <p className="text-gray-600 mb-2">Order Id</p>
                <p className="text-2xl font-bold text-gray-900">{orderDetails._id}</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-medium">
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">{getEstimatedDeliveryDate()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">Razorpay</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">₹{orderDetails.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Order Status */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
                
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200">
                    <div className="absolute top-0 left-0 h-full bg-teal-500" style={{ width: '25%' }}></div>
                  </div>
                  
                  {/* Status Points */}
                  <div className="flex justify-between relative z-10">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-2">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-sm font-medium text-teal-700">Confirmed</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-2">
                        <Package size={20} />
                      </div>
                      <p className="text-sm text-gray-500">Processing</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-2">
                        <Truck size={20} />
                      </div>
                      <p className="text-sm text-gray-500">Shipped</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-2">
                        <Calendar size={20} />
                      </div>
                      <p className="text-sm text-gray-500">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* What's Next */}
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="font-semibold text-teal-700 mb-2">What's Next?</h3>
                <p className="text-teal-600 mb-4">
                  We're preparing your raw materials order for shipment. You'll receive an email confirmation with tracking details soon.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <Link 
                    href="/rawmaterials"
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  
                  <Link 
                    href="/order-history"
                    className="px-6 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors flex items-center"
                  >
                    View Orders
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Questions about your order? <Link href="/contact" className="text-teal-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}