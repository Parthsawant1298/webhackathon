"use client";

import Footer from '@/components/Footer';
import SupplierHeader from '@/components/SupplierHeader';
import { Edit, Eye, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SupplierDashboard() {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/supplier/auth/user');
        if (response.ok) {
          const data = await response.json();
          setSupplier(data.supplier);
          fetchRawMaterials(data.supplier._id);
        } else {
          router.push('/supplier/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/supplier/login');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRawMaterials = async (supplierId) => {
      try {
        const response = await fetch(`/api/supplier/rawmaterials?supplierId=${supplierId}`);
        if (response.ok) {
          const data = await response.json();
          setRawMaterials(data.rawMaterials || []);
        }
      } catch (error) {
        console.error('Failed to fetch raw materials:', error);
        setError('Failed to load raw materials');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white">
        <SupplierHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white">
      <SupplierHeader />
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Welcome Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {supplier.supplierName}!
                </h1>
                <p className="text-gray-600">
                  Manage your raw materials and business efficiently.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{rawMaterials.length}</div>
                    <div className="text-sm text-gray-500">Raw Materials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => router.push('/supplier/add-raw-material')}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Plus size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Raw Material</h3>
                  <p className="text-gray-600 text-sm">List new raw materials for sale</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Materials</h3>
                  <p className="text-2xl font-bold text-gray-900">{rawMaterials.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Eye size={24} className="text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Listings</h3>
                  <p className="text-2xl font-bold text-gray-900">{rawMaterials.filter(material => material.isActive).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Materials List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Raw Materials</h2>
                <button 
                  onClick={() => router.push('/supplier/add-raw-material')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add New
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              {rawMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No raw materials yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first raw material to the platform.</p>
                  <button 
                    onClick={() => router.push('/supplier/add-raw-material')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Raw Material
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rawMaterials.map((material) => (
                    <div key={material._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={material.mainImage}
                          alt={material.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate">{material.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{material.category}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">₹{material.price}</span>
                            {material.originalPrice > material.price && (
                              <span className="text-sm text-gray-500 line-through">₹{material.originalPrice}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">Qty: {material.quantity}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center">
                            <Eye size={14} className="mr-1" />
                            View
                          </button>
                          <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center">
                            <Edit size={14} className="mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
