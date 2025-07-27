"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GalleryComponent = () => {
  const [activeImage, setActiveImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const router = useRouter();

  // Fetch products from database
  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all products using your existing API
        const response = await fetch('/api/rawmaterials/available');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Filter to only include products with images
        const productsWithImages = data.rawMaterials.filter(product => 
          product.mainImage || (product.images && product.images.length > 0)
        );
        
        // Randomly select up to 12 products
        const randomProducts = [];
        const tempProducts = [...productsWithImages];
        
        // Get 12 random products or all if less than 12
        const count = Math.min(12, tempProducts.length);
        
        for (let i = 0; i < count; i++) {
          // Get random index
          const randomIndex = Math.floor(Math.random() * tempProducts.length);
          // Add product to selected array
          randomProducts.push(tempProducts[randomIndex]);
          // Remove from temp array to avoid duplicates
          tempProducts.splice(randomIndex, 1);
        }
        
        setProducts(randomProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load product gallery. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeImage) {
        setActiveImage(null);
      }
    };

    if (activeImage) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [activeImage]);

  const handleImageClick = (product) => {
    console.log('Image clicked:', product.name); // Debug log
    setActiveImage(product);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setActiveImage(null);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (!activeImage) return;
    const currentIndex = products.findIndex(item => item._id === activeImage._id);
    const nextIndex = (currentIndex + 1) % products.length;
    setActiveImage(products[nextIndex]);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (!activeImage) return;
    const currentIndex = products.findIndex(item => item._id === activeImage._id);
    const prevIndex = (currentIndex - 1 + products.length) % products.length;
    setActiveImage(products[prevIndex]);
  };

  const navigateToProduct = (productId, e) => {
    e?.stopPropagation();
    router.push(`/rawmaterials/${productId}`);
  };

  const handleImageError = (productId) => {
    console.log('Image error for product:', productId); // Debug log
    setImageErrors(prev => new Set([...prev, productId]));
  };

  const getImageSrc = (product) => {
    if (imageErrors.has(product._id)) {
      return "/placeholder.png";
    }
    return product.mainImage || (product.images && product.images[0]) || "/placeholder.png";
  };

  // Close modal when clicking outside the image
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-8 md:py-12 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{borderTopColor: '#347433', borderBottomColor: '#347433'}}></div>
          <p className="animate-pulse" style={{color: '#2d5f2d'}}>Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-8 md:py-12 min-h-[400px] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 text-white rounded-md transition-colors"
            style={{backgroundColor: '#347433'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 py-8 md:py-12 min-h-[400px] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <p className="text-gray-500 text-lg">No products available to display in the gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gallery Header */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Our <span style={{color: '#347433'}}>Raw Material Gallery</span>
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Explore our comprehensive range of high-quality raw materials for street vendors
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="group relative aspect-square overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer bg-gray-100"
              onClick={() => handleImageClick(product)}
            >
              <Image 
                src={getImageSrc(product)}
                alt={product.name || 'Product image'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => handleImageError(product._id)}
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs" style={{color: '#7dd87e'}}>{product.category || 'Raw Materials'}</p>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div 
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={handleModalClick}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-[10000]"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Previous Button */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-[10000]"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Next Button */}
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-[10000]"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Modal Content */}
            <div className="relative max-w-5xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden shadow-2xl">
              {/* Image Container */}
              <div className="relative w-full h-[60vh] bg-gray-100">
                <Image 
                  src={getImageSrc(activeImage)}
                  alt={activeImage.name || 'Product image'}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-contain"
                  onError={() => handleImageError(activeImage._id)}
                  priority
                />
              </div>
              
              {/* Product Details */}
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeImage.name}</h3>
                    <p className="text-sm font-medium mb-4" style={{color: '#347433'}}>{activeImage.category || 'Raw Materials'}</p>
                    
                    {activeImage.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activeImage.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900">₹{activeImage.price?.toLocaleString() || 0}</span>
                        {activeImage.originalPrice && activeImage.originalPrice > activeImage.price && (
                          <span className="text-lg text-gray-500 line-through ml-3">₹{activeImage.originalPrice?.toLocaleString()}</span>
                        )}
                      </div>
                      
                      {activeImage.discount && activeImage.discount > 0 && (
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                          -{activeImage.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => navigateToProduct(activeImage._id, e)}
                    className="flex items-center text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    style={{backgroundColor: '#347433'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
                  >
                    <Info className="h-5 w-5 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryComponent;