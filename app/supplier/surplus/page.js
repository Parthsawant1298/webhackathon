'use client'
import Footer from '@/components/Footer';
import SupplierHeader from '@/components/SupplierHeader';
import { Calendar, DollarSign, Package, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SupplierSurplusPage() {
  const [surplus, setSurplus] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch all available surplus
  const fetchSurplus = async () => {
    setLoading(true);
    const res = await fetch('/api/surplus');
    const data = await res.json();
    setSurplus(data.surplus || []);
    setLoading(false);
  };

  useEffect(() => { fetchSurplus(); }, []);

  // Accept & pay for surplus
  const handleAccept = async (item) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surplus/${item._id}/accept`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success && data.order && window.Razorpay) {
        // Create Razorpay options
        const options = {
          key: data.key_id,
          amount: data.order.amount,
          currency: 'INR',
          name: 'Surplus Purchase',
          description: `Buy ${item.rawMaterialName}`,
          order_id: data.order.id,
          handler: function (response) {
            // Call payment callback API
            fetch(`/api/surplus/${item._id}/payment-callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            }).then(() => {
              alert('Payment successful! Surplus purchased.');
              fetchSurplus(); // Refresh the list
            });
          },
          prefill: {},
          theme: { color: '#347433' },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Surplus</h1>
            <p className="text-gray-600">Browse and purchase surplus materials from vendors</p>
          </div>

          {/* Surplus List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Package className="mr-2" style={{color: '#347433'}} />
              Available Surplus Items
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : surplus.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No surplus items available at the moment.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for new surplus listings!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surplus.map(item => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{item.rawMaterialName}</h3>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Available
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ₹{item.pricePerKg}/kg
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {item.quantity} kg available
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Expires: {item.expiryDate.slice(0, 10)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        From: {item.vendorCode}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <span className="font-semibold text-lg" style={{color: '#347433'}}>
                          ₹{item.pricePerKg * item.quantity}
                        </span>
                      </div>
                      
                      <button 
                        className="w-full bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center"
                        onClick={() => handleAccept(item)}
                        disabled={loading}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {loading ? 'Processing...' : 'Accept & Pay'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 