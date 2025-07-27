'use client'
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Calendar, CheckCircle, Clock, DollarSign, Edit, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VendorSurplusPage() {
  const [surplus, setSurplus] = useState([]);
  const [form, setForm] = useState({ rawMaterialName: '', pricePerKg: '', quantity: '', expiryDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch vendor's surplus
  const fetchSurplus = async () => {
    setLoading(true);
    const res = await fetch('/api/surplus/vendor');
    const data = await res.json();
    setSurplus(data.surplus || []);
    setLoading(false);
  };

  useEffect(() => { fetchSurplus(); }, []);

  // Add or edit surplus
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/surplus/${editingId}` : '/api/surplus';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    if (res.ok) {
      setSubmitSuccess(true);
      setForm({ rawMaterialName: '', pricePerKg: '', quantity: '', expiryDate: '' });
      setEditingId(null);
      fetchSurplus();
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
    setLoading(false);
  };

  // Delete surplus
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this surplus?')) {
      setLoading(true);
      await fetch(`/api/surplus/${id}`, { method: 'DELETE' });
      fetchSurplus();
    }
  };

  // Start editing
  const handleEdit = (item) => {
    setForm({
      rawMaterialName: item.rawMaterialName,
      pricePerKg: item.pricePerKg,
      quantity: item.quantity,
      expiryDate: item.expiryDate.slice(0, 10),
    });
    setEditingId(item._id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Surplus</h1>
            <p className="text-gray-600">Manage your surplus materials and track sales</p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Surplus {editingId ? 'updated' : 'added'} successfully!
            </div>
          )}

          {/* Add Surplus Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="mr-2" style={{color: '#347433'}} />
              {editingId ? 'Edit Surplus' : 'Add New Surplus'}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input 
                required 
                placeholder="Raw Material Name" 
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                value={form.rawMaterialName} 
                onChange={e => setForm(f => ({ ...f, rawMaterialName: e.target.value }))} 
              />
              <input 
                required 
                type="number" 
                placeholder="Price per Kg (₹)" 
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                value={form.pricePerKg} 
                onChange={e => setForm(f => ({ ...f, pricePerKg: e.target.value }))} 
              />
              <input 
                required 
                type="number" 
                placeholder="Quantity (kg)" 
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                value={form.quantity} 
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} 
              />
              <input 
                required 
                type="date" 
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                value={form.expiryDate} 
                onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} 
              />
              <div className="md:col-span-2 lg:col-span-4 flex gap-3">
                <button 
                  type="submit" 
                  className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingId ? 'Update' : 'Add')} Surplus
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => { 
                      setEditingId(null); 
                      setForm({ rawMaterialName: '', pricePerKg: '', quantity: '', expiryDate: '' }); 
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Surplus List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Package className="mr-2" style={{color: '#347433'}} />
              My Surplus Items
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : surplus.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No surplus items yet. Add your first surplus above!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surplus.map(item => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{item.rawMaterialName}</h3>
                      {item.status === 'Sold' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ₹{item.pricePerKg}/kg
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {item.quantity} kg
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Expires: {item.expiryDate.slice(0, 10)}
                      </div>
                    </div>

                    {item.status === 'Sold' ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-green-800 font-semibold">
                          Sold for ₹{item.pricePerKg * item.quantity}
                        </div>
                        {item.acceptedBy && (
                          <div className="text-sm text-green-700">
                            to <SupplierName supplierId={item.acceptedBy} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button 
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
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

// Helper component to fetch and show supplier name
function SupplierName({ supplierId }) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (!supplierId) return;
    fetch(`/api/supplier/user?id=${supplierId}`)
      .then(res => res.json())
      .then(data => setName(data.user?.supplierName || 'Supplier'));
  }, [supplierId]);
  return <span>{name}</span>;
} 