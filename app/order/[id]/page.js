// app/order/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderDetailsPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/order/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data.order);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Determine order status details
  const getOrderStatusDetails = (status) => {
    switch (status) {
      case 'processing':
        return { 
          icon: <Package className="text-blue-500" size={20} />,
          description: 'Your order is being packed and prepared for shipping.',
          color: 'text-blue-500'
        };
      case 'delivered':
        return { 
          icon: <CheckCircle className="text-green-500" size={20} />,
          description: 'Your order has been successfully delivered.',
          color: 'text-green-500'
        };
      case 'payment failed':
        return { 
          icon: <XCircle className="text-red-500" size={20} />,
          description: 'Payment for this order has failed.',
          color: 'text-red-500'
        };
      default:
        return { 
          icon: <Package className="text-gray-500" size={20} />,
          description: 'Order status is currently unavailable.',
          color: 'text-gray-500'
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Unable to Fetch Order Details</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
            <Link 
              href="/order-history"
              className="inline-block w-full sm:w-auto px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              Back to Order History
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // No order found
  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8 flex items-center justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center mx-2">
            <AlertCircle className="mx-auto mb-4 text-yellow-500" size={40} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              The order you are looking for could not be found.
            </p>
            <Link 
              href="/order-history"
              className="inline-block w-full sm:w-auto px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              Back to Order History
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Order status details
  const statusDetails = getOrderStatusDetails(order.status);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/order-history" 
            className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ChevronLeft size={16} className="mr-1 sm:mr-2" />
            Back to Order History
          </Link>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Order Header */}
            <div className="bg-teal-600 text-white px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Order Details</h1>
                <p className="text-teal-100 text-sm sm:text-base break-all">Order ID: {order._id}</p>
              </div>
              <div className="flex items-center space-x-2">
                {statusDetails.icon}
                <span className={`capitalize font-semibold ${statusDetails.color} text-sm sm:text-base`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Status Section */}
            <div className="p-3 sm:p-6 bg-gray-50 border-b">
              <div className="flex items-start space-x-2 sm:space-x-4">
                {statusDetails.icon}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                    {order.status} Order
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">{statusDetails.description}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-3 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Items</h2>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item) => (
                  <div 
                    key={item._id} 
                    className="flex items-center space-x-2 sm:space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0">
                      <Image 
                        src={item.rawMaterial.mainImage} 
                        alt={item.rawMaterial.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 640px) 56px, 80px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.rawMaterial.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {item.rawMaterial.description}
                      </p>
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
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-3 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-teal-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                <MapPin size={20} className="inline-block mr-2 text-teal-600" />
                Shipping Address
              </h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {order.shippingAddress.name}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {order.shippingAddress.address}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {order.shippingAddress.country}
                </p>
                <p className="text-gray-600 text-sm sm:text-base mt-2">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                <CreditCard size={20} className="inline-block mr-2 text-teal-600" />
                Payment Details
              </h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">Razorpay</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm sm:text-base">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-medium break-all">
                    {order.paymentInfo?.razorpayPaymentId || 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}