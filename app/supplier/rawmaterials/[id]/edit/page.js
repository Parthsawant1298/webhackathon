"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, X, Plus, Trash, ArrowLeft, Info } from 'lucide-react';
import { use } from 'react';
import Image from 'next/image';
import SupplierHeader from '@/components/SupplierHeader';
import Footer from '@/components/Footer';

export default function EditRawMaterialPage({ params }) {
  const router = useRouter();
  // Use React.use() to unwrap params
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [material, setMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    quantity: '',
    category: '',
    subcategory: '',
    features: '',
    tags: ''
  });

  // Raw material category examples
  const categoryExamples = {
    "Industrial Materials": "Steel, Aluminum, Copper, Iron, etc.",
    "Chemical Supplies": "Acids, Solvents, Catalysts, Polymers, etc.",
    "Agricultural Products": "Wheat, Rice, Cotton, Fertilizers, etc.",
    "Textile Materials": "Cotton, Silk, Wool, Synthetic fibers, etc.",
    "Construction Materials": "Cement, Sand, Gravel, Bricks, etc.",
    "Food Ingredients": "Sugar, Salt, Spices, Oils, etc."
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/supplier/auth/user');
        if (!authResponse.ok) {
          router.push('/supplier/login');
          return;
        }
        
        const authData = await authResponse.json();
        if (!authData.success || !authData.supplier) {
          router.push('/supplier/login');
          return;
        }
        
        setSupplier(authData.supplier);
        
        // Fetch material details
        const response = await fetch(`/api/rawmaterials/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch raw material');
        }

        // Check if this material belongs to the current supplier
        if (data.rawMaterial.createdBy._id !== authData.supplier.id) {
          setError("You don't have permission to edit this material");
          return;
        }

        setMaterial(data.rawMaterial);
        setFormData({
          name: data.rawMaterial.name || '',
          description: data.rawMaterial.description || '',
          price: data.rawMaterial.price || '',
          originalPrice: data.rawMaterial.originalPrice || '',
          quantity: data.rawMaterial.quantity || '',
          category: data.rawMaterial.category || '',
          subcategory: data.rawMaterial.subcategory || '',
          features: data.rawMaterial.features ? data.rawMaterial.features.join(', ') : '',
          tags: data.rawMaterial.tags ? data.rawMaterial.tags.join(', ') : ''
        });
        setImages(data.rawMaterial.images || []);
      } catch (error) {
        console.error('Fetch raw material error:', error);
        setError('Failed to load raw material. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      checkAuthAndFetch();
    }
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newImageFiles = [...files];
    const newImagePreviews = files.map(file => {
      const preview = URL.createObjectURL(file);
      return {
        url: preview,
        alt: file.name,
        isNew: true,
        file: file
      };
    });
    
    setImages(prev => [...prev, ...newImagePreviews]);
    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    
    // If it's an existing image (not a new upload), track it for deletion from server
    if (!imageToRemove.isNew && imageToRemove._id) {
      setRemovedImages(prev => [...prev, imageToRemove._id]);
    }
    
    // Remove from images array
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // If it's a new image, also remove from imageFiles
    if (imageToRemove.isNew) {
      const fileIndex = imageFiles.findIndex(file => 
        URL.createObjectURL(file) === imageToRemove.url
      );
      if (fileIndex !== -1) {
        const newImageFiles = [...imageFiles];
        newImageFiles.splice(fileIndex, 1);
        setImageFiles(newImageFiles);
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (images.length === 0) {
    setError('At least one raw material image is required');
    return;
  }
  
  setIsSaving(true);
  setError('');
  setSuccessMessage('');
  
  try {
    const formDataToSend = new FormData();
    
    // 🔥 FIX: Add the material ID to FormData
    formDataToSend.append('rawMaterialId', id);
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      // For arrays, convert back from comma-separated string
      if (key === 'features' || key === 'tags') {
        const items = formData[key].split(',').map(item => item.trim()).filter(Boolean);
        formDataToSend.append(key, JSON.stringify(items));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Add removed image IDs
    if (removedImages.length > 0) {
      formDataToSend.append('removedImages', JSON.stringify(removedImages));
    }
    
    // Add new images
    imageFiles.forEach((file, index) => {
      formDataToSend.append(`newImage${index}`, file);
    });
    
    // 🔥 FIX: Include ID in URL as well
    const response = await fetch(`/api/supplier/rawmaterials?id=${id}`, {
      method: 'PUT',
      body: formDataToSend
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Failed to update raw material');
    }
    
    setSuccessMessage('Raw material updated successfully!');
    
    // Wait briefly to show success message, then redirect
    setTimeout(() => {
      router.push(`/supplier/rawmaterials/${id}`);
    }, 1500);
    
  } catch (error) {
    console.error('Raw material update error:', error);
    setError(error.message || 'Failed to update raw material');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setIsSaving(false);
  }
};
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <SupplierHeader />
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-teal-700 animate-pulse">Loading raw material...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!material || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <SupplierHeader />
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <Info size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-500 text-lg font-semibold mb-4">{error || "Raw material not found"}</p>
            <p className="text-gray-600 mb-6">We couldn&apos;t find the raw material you&apos;re looking for.</p>
            <button
              onClick={() => router.push("/supplier/rawmaterials")}
              className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md"
            >
              Back to Materials
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
      <SupplierHeader />
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Supplier Actions Bar */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/supplier/rawmaterials/${id}`)}
                className="text-gray-600 hover:text-gray-800 mr-4 flex items-center"
              >
                <ArrowLeft size={18} className="mr-1" />
                <span>Back to Material</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Editing: {material.name}</h1>
            </div>
            <button 
              form="edit-material-form"
              type="submit"
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center disabled:opacity-70"
            >
              <Save size={18} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <button onClick={() => router.push('/supplier/rawmaterials')} className="hover:text-teal-600 transition-colors">
                Supplier
              </button>
              <span className="mx-2">/</span>
              <button onClick={() => router.push('/supplier/rawmaterials')} className="hover:text-teal-600 transition-colors">
                Raw Materials
              </button>
              <span className="mx-2">/</span>
              <button onClick={() => router.push(`/supplier/rawmaterials/${id}`)} className="hover:text-teal-600 transition-colors">
                {material.name}
              </button>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">Edit</span>
            </div>
          </div>
          
          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
              <h2 className="text-2xl font-bold">Edit Raw Material</h2>
              <p className="text-teal-100 mt-1">
                Update raw material information and inventory
              </p>
            </div>
            
            {/* Success/Error Messages */}
            {error && (
              <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="m-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Save className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form */}
            <form id="edit-material-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Material Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    name="category"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                  {formData.category && categoryExamples[formData.category] && (
                    <p className="mt-1 text-xs text-gray-500">
                      Examples: {categoryExamples[formData.category]}
                    </p>
                  )}
                </div>
                
                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional - helps with material organization
                  </p>
                </div>
                
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional - for discounted items"
                  />
                </div>
                
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Comma-separated tags"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter tags separated by commas (e.g., industrial, eco-friendly, premium)
                  </p>
                </div>
                
                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    rows="5"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                {/* Features */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <textarea
                    name="features"
                    rows="3"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="Comma-separated list of features"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter features separated by commas (e.g., High purity, Temperature resistant, Food grade)
                  </p>
                </div>
                
                {/* Raw Material Images */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raw Material Images *</label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    {/* Current Images */}
                    {images.map((image, index) => (
                      <div key={index} className="relative h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={image.url} 
                          alt={image.alt || `Raw material image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-70 text-white text-xs py-1 text-center">
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add image button */}
                    <label className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center text-gray-500">
                        <Plus size={24} className="mb-1" />
                        <span className="text-xs text-center px-2">Add Image</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    At least one image is required. The first image will be used as the main raw material image.
                    Click on an image to remove it.
                  </p>
                </div>
              </div>
              
              {/* Form buttons */}
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push(`/supplier/rawmaterials/${id}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}