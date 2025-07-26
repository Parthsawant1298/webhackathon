"use client";

import { ArrowLeft, Camera, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SupplierProfile = () => {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if supplier is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/supplier/auth/user');
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        setSupplier(data.supplier);
        if (data.supplier.profilePicture) {
          setImagePreview(data.supplier.profilePicture);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Redirect to login page if not authenticated
        router.push('/supplier/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      
      setError(''); // Clear previous errors
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!profileImage) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await fetch('/api/supplier/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update supplier data with new profile picture
      setSupplier(prev => ({
        ...prev,
        profilePicture: data.profilePicture
      }));
      
      // Also update image preview with the Cloudinary URL
      setImagePreview(data.profilePicture);
      
      // Clear the selected file
      setProfileImage(null);
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/supplier/auth/logout', {
        method: 'POST',
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white">
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => router.push('/supplier/dashboard')}
              className="mb-6 flex items-center text-green-600 hover:text-green-800 transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Supplier Profile</h1>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-green-500">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-20 w-20 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <label htmlFor="profile-upload" className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                      <Camera size={18} />
                      <span>Change Photo</span>
                    </label>
                    <input 
                      type="file" 
                      id="profile-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange} 
                    />
                    
                    {profileImage && (
                      <button 
                        className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Save Photo'}
                      </button>
                    )}
                    
                    {error && (
                      <p className="mt-2 text-red-500 text-sm">{error}</p>
                    )}
                  </div>
                </div>
                
                {/* Supplier Info Section */}
                <div className="flex-grow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Supplier Name</h3>
                      <p className="text-lg font-medium text-gray-900">{supplier?.supplierName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="text-lg font-medium text-gray-900">{supplier?.email}</p>
                    </div>
                    
                    {supplier?.phone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                        <p className="text-lg font-medium text-gray-900">{supplier.phone}</p>
                      </div>
                    )}
                    
                    {supplier?.businessAddress && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Business Address</h3>
                        <p className="text-lg font-medium text-gray-900">{supplier.businessAddress}</p>
                      </div>
                    )}
                    
                    {supplier?.businessType && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                        <p className="text-lg font-medium text-gray-900">{supplier.businessType}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                      <p className="text-lg font-medium text-gray-900">
                        {supplier?.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={handleLogout}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@supplymind.com" className="text-green-600 hover:underline">
                          support@supplymind.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierProfile;
