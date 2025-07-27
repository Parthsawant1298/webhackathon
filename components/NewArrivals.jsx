// components/NewArrivals.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Heart, CreditCard } from 'lucide-react';

export default function NewArrivals() {
  const router = useRouter();
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(1);
  const carouselRef = useRef(null);

  // Update itemsToShow based on screen size
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsToShow(1); // Mobile: 1 product
      } else if (width < 768) {
        setItemsToShow(2); // Small tablet: 2 products
      } else if (width < 1200) {
        setItemsToShow(3); // Medium screens: 3 products
      } else {
        setItemsToShow(4); // Large desktop: 4 products
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all raw materials
        const response = await fetch('/api/rawmaterials/available');
        
        if (!response.ok) {
          throw new Error('Failed to fetch raw materials');
        }
        
        const data = await response.json();
        
        // Sort raw materials by createdAt date (newest first)
        // Assuming each raw material has a createdAt field from the database
        const sortedRawMaterials = data.rawMaterials
          .sort((a, b) => {
            // If createdAt is available, sort by it (newest first)
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // If _id is MongoDB ObjectId, we can use it as fallback since it contains timestamp
            return b._id > a._id ? 1 : -1;
          });
          
        // Get the 10 newest raw materials
        const newest = sortedRawMaterials.slice(0, 10);
        setNewArrivals(newest);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('rawMaterialFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setError('Failed to load raw materials. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Calculate card width based on container and items to show
  const getCardWidth = () => {
    if (typeof window === 'undefined') return '100%';
    
    // More conservative padding calculation for mobile
    const containerPadding = window.innerWidth < 640 ? 80 : window.innerWidth < 1200 ? 96 : 160;
    const gap = window.innerWidth < 640 ? 12 : 24; // Smaller gap on mobile
    const availableWidth = window.innerWidth - containerPadding;
    const totalGaps = (itemsToShow - 1) * gap;
    const cardWidth = (availableWidth - totalGaps) / itemsToShow;
    
    // More restrictive max widths to ensure cards fit
    let minWidth, maxWidth;
    
    if (window.innerWidth < 640) {
      // Mobile - ensure it fits within screen
      minWidth = 260;
      maxWidth = Math.min(320, window.innerWidth - 80); // Never exceed screen minus padding
    } else if (window.innerWidth < 1200) {
      // Tablet and medium screens
      minWidth = 220;
      maxWidth = 280;
    } else {
      // Large desktop - optimized for wider container
      minWidth = 260;
      maxWidth = 320;
    }
    
    return Math.max(minWidth, Math.min(maxWidth, Math.floor(cardWidth)));
  };

  // Carousel navigation functions
  const scrollNext = () => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth();
      const gap = window.innerWidth < 640 ? 12 : 24; // Use same gap as getCardWidth
      const scrollDistance = (cardWidth + gap) * itemsToShow;
      
      carouselRef.current.scrollBy({
        left: scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth();
      const gap = window.innerWidth < 640 ? 12 : 24; // Use same gap as getCardWidth
      const scrollDistance = (cardWidth + gap) * itemsToShow;
      
      carouselRef.current.scrollBy({
        left: -scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (!response.ok) {
        return false
      }
      const userData = await response.json()
      return !!userData.user
    } catch (error) {
      return false
    }
  }

  const handleAddToCart = async (rawMaterialId, e) => {
    e.stopPropagation();
    try {
      // Check if user is logged in
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawMaterialId,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      // Show toast notification
      showToast('Raw material added to cart!', 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast(error.message || 'Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async (rawMaterialId, e) => {
    e.stopPropagation();
    try {
      // Check if user is logged in
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawMaterialId,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
      showToast(error.message || 'Failed to process. Please try again.', 'error');
    }
  };

  const toggleFavorite = (rawMaterialId, e) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(rawMaterialId)) {
      newFavorites = favorites.filter(id => id !== rawMaterialId);
    } else {
      newFavorites = [...favorites, rawMaterialId];
      showToast('Added to favorites!', 'success');
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('rawMaterialFavorites', JSON.stringify(newFavorites));
  };

  // Toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up text-sm sm:text-base ${
      type === 'success' ? '' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    if (type === 'success') {
      toast.style.backgroundColor = '#347433';
    }
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Raw material card component
  const RawMaterialCard = ({ rawMaterial }) => {
    const cardWidth = getCardWidth();
    
    return (
      <div 
        key={rawMaterial._id} 
        className="flex-shrink-0 snap-start bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
        style={{ 
          width: `${cardWidth}px`,
          height: 'auto',
          minHeight: '320px'
        }}
        onClick={() => router.push(`/rawmaterials/${rawMaterial._id}`)}
      >
        <div className="relative cursor-pointer overflow-hidden bg-gray-100" 
             style={{ 
               height: window.innerWidth < 640 ? '160px' : 
                      window.innerWidth < 768 ? '180px' : 
                      window.innerWidth < 1024 ? '200px' : '220px'
             }}>
          <img 
            src={rawMaterial.mainImage || "/placeholder.svg"} 
            alt={rawMaterial.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            style={{
              imageRendering: 'auto'
            }}
          />
          
          {/* New tag for emphasizing it's a new arrival */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 text-white text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md" style={{backgroundColor: '#347433'}}>
            NEW
          </div>
          
          {rawMaterial.discount > 0 && (
            <div className="absolute top-1 left-10 sm:top-2 sm:left-12 lg:left-16 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md">
              -{rawMaterial.discount}%
            </div>
          )}
          
          <button 
            onClick={(e) => toggleFavorite(rawMaterial._id, e)}
            className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 lg:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart 
              size={window.innerWidth < 640 ? 14 : 16} 
              className={favorites.includes(rawMaterial._id) ? "text-red-500" : "text-gray-400"} 
              fill={favorites.includes(rawMaterial._id) ? "currentColor" : "none"} 
            />
          </button>
        </div>
        
        <div className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-1 sm:mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={window.innerWidth < 640 ? 12 : 14} 
                    fill={i < Math.floor(rawMaterial.ratings || 0) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({rawMaterial.numReviews || 0})</span>
            </div>
            
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 truncate">{rawMaterial.name}</h3>
            
            <div className="flex items-center mb-2 sm:mb-3">
              <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">₹{rawMaterial.price?.toLocaleString() || 0}</span>
              {rawMaterial.originalPrice && rawMaterial.originalPrice > rawMaterial.price && (
                <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">₹{rawMaterial.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 mt-auto">
            <button 
              onClick={(e) => handleAddToCart(rawMaterial._id, e)}
              className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-2 rounded-md flex items-center justify-center text-white transition-colors"
              style={{backgroundColor: '#347433'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
            >
              <ShoppingCart size={window.innerWidth < 640 ? 12 : 14} className="mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline sm:hidden lg:inline">Cart</span>
              <span className="xs:hidden sm:inline lg:hidden">Add</span>
              <span className="inline xs:hidden">+</span>
            </button>
            
            <button 
              onClick={(e) => handleBuyNow(rawMaterial._id, e)}
              className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-2 rounded-md flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <CreditCard size={window.innerWidth < 640 ? 12 : 14} className="mr-0.5 sm:mr-1" />
              Buy
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-t-2 border-b-2" style={{borderTopColor: '#347433', borderBottomColor: '#347433'}}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 sm:py-8 flex justify-center px-4">
        <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  if (newArrivals.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(newArrivals.length / itemsToShow);

  return (
    <div className="py-3 sm:py-4 md:py-6 lg:py-10" style={{background: 'linear-gradient(135deg, #f0f9f0 0%, #f9f9f9 50%, #ffffff 100%)'}}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-full sm:max-w-6xl lg:max-w-[1580px]">
        {/* Title at the top */}
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            New <span style={{color: '#347433'}}>Arrivals</span>
          </h2>
        </div>
        
        {/* Raw materials carousel with navigation arrows on sides */}
        <div className="relative">
          {/* Left arrow - Show on all screen sizes */}
          <button 
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 lg:p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-300 -ml-4 sm:-ml-6 lg:-ml-12"
            onMouseEnter={(e) => e.target.style.color = '#347433'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            <ChevronLeft size={window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 18 : 20} className="md:w-6 md:h-6" />
          </button>
          
          {/* Right arrow - Show on all screen sizes */}
          <button 
            onClick={scrollNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 lg:p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-300 -mr-4 sm:-mr-6 lg:-mr-12"
            onMouseEnter={(e) => e.target.style.color = '#347433'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            <ChevronRight size={window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 18 : 20} className="md:w-6 md:h-6" />
          </button>
          
          {/* Raw materials container */}
          <div className="mx-8 sm:mx-8 lg:mx-16">
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-3 sm:gap-4 lg:gap-8 pb-3 sm:pb-4 hide-scrollbar snap-x snap-mandatory"
            >
              {newArrivals.map((rawMaterial) => (
                <RawMaterialCard key={rawMaterial._id} rawMaterial={rawMaterial} />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation dots for mobile */}
        <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2 sm:hidden">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsToShow) === index ? '' : 'bg-gray-300'
              }`}
              style={Math.floor(currentIndex / itemsToShow) === index ? {backgroundColor: '#347433'} : {}}
              onClick={() => {
                if (carouselRef.current) {
                  const cardWidth = getCardWidth();
                  const gap = 12; // Use mobile gap consistently
                  const scrollDistance = (cardWidth + gap) * itemsToShow * index;
                  carouselRef.current.scrollTo({
                    left: scrollDistance,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
        </div>
      </div>
      
      {/* CSS for animations and hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }

        /* Extra small devices breakpoint */
        @media (min-width: 480px) {
          .xs\:inline {
            display: inline !important;
          }
          .xs\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}