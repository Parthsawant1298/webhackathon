'use client'
import Footer from '@/components/Footer';
import SupplierHeader from '@/components/SupplierHeader';
import { Calendar, CheckCircle, DollarSign, Package, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SurplusBoughtPage() {
  const [bought, setBought] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch surplus bought by this supplier
  const fetchBought = async () => {
    setLoading(true);
    const res = await fetch('/api/surplus/bought');
    const data = await res.json();
    setBought(data.surplus || []);
    setLoading(false);
  };

  useEffect(() => { fetchBought(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Surplus Bought</h1>
            <p className="text-gray-600">Track your surplus purchases and transactions</p>
          </div>

          {/* Surplus Bought List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ShoppingBag className="mr-2" style={{color: '#347433'}} />
              My Purchased Surplus
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : bought.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No surplus purchases yet.</p>
                <p className="text-sm text-gray-500 mt-2">Start browsing available surplus to make your first purchase!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bought.map(item => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{item.rawMaterialName}</h3>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ₹{item.pricePerKg}/kg
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {item.quantity} kg purchased
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Purchased: {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        From: {item.vendorCode}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-green-800 font-semibold">
                        Total Paid: ₹{item.pricePerKg * item.quantity}
                      </div>
                      <div className="text-sm text-green-700">
                        Payment completed successfully
                      </div>
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