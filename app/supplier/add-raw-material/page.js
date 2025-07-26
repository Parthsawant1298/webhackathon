"use client";

import Footer from '@/components/Footer';
import SupplierHeader from '@/components/SupplierHeader';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AddRawMaterialPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    quantity: '1',
    category: '',
    subcategory: '',
    features: '',
    tags: ''
  });

  // Cleanup image URLs on component unmount
  useEffect(() => {
    return () => {
      images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  // Raw material category examples
  const categoryExamples = {
    "Industrial Materials": "Steel, Aluminum, Copper, Iron, etc.",
    "Chemical Supplies": "Acids, Solvents, Catalysts, Polymers, etc.",
    "Agricultural Products": "Wheat, Rice, Cotton, Fertilizers, etc.",
    "Textile Materials": "Cotton, Silk, Wool, Synthetic fibers, etc.",
    "Construction Materials": "Cement, Sand, Gravel, Bricks, etc.",
    "Food Ingredients": "Sugar, Salt, Spices, Oils, etc."
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // Validate files before processing
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP images are allowed.`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
    }
    
    // Clear any previous errors
    setError('');
    
    // Limit to 10 images total
    const newFiles = files.slice(0, 10 - imageFiles.length);
    
    // Create preview URLs
    const newImagePreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newImagePreviews]);
    setImageFiles(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(newImages[index]);
    
    // Remove the preview URL
    newImages.splice(index, 1);
    // Remove the file
    newImageFiles.splice(index, 1);
    
    setImages(newImages);
    setImageFiles(newImageFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageFiles.length === 0) {
      setError('At least one raw material image is required');
      return;
    }

    if (!formData.subcategory) {
      setError('Subcategory is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Log form data for debugging
      console.log("Form data being sent:", {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory
      });
      
      // Add images
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`image${index}`, file);
      });
      
      const response = await fetch('/api/supplier/rawmaterials', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create raw material');
      }
      
      // Success - clean up and redirect
      images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Show success message before redirect
      alert('Raw material created successfully!');
      router.push('/supplier/dashboard');
      
    } catch (error) {
      console.error('Raw material creation error:', error);
      setError(error.message || 'Failed to create raw material');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white">
      <SupplierHeader />
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Raw Material</h1>
              
              {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 99.99"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 149.99 (Optional)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g. Industrial Materials, Chemical Supplies"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Example categories: Industrial Materials, Chemical Supplies, Agricultural Products
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="e.g. Steel, Copper, Wheat, Cotton"
                    required
                  />
                  {formData.category && categoryExamples[formData.category] && (
                    <p className="mt-1 text-xs text-gray-500">
                      Examples for {formData.category}: {categoryExamples[formData.category]}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                  <input
                    type="text"
                    name="features"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Tag 1, Tag 2, Tag 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raw Material Images</label>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2 mb-4">
                    {/* Image previews */}
                    {images.map((image, index) => (
                      <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={image} 
                          alt={`Raw material preview ${index + 1}`} 
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add image button */}
                    {images.length < 10 && (
                      <label className="flex items-center justify-center h-24 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center text-gray-500">
                          <Plus size={24} />
                          <span className="text-xs mt-1">Add Image</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload up to 10 images. First image will be the main raw material image.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-70"
                >
                  {isLoading ? 'Creating Raw Material...' : 'Create Raw Material'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}