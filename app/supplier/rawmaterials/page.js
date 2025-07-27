"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Share, Search, Filter, X, ChevronDown, Tag, Package, ArrowUpRight, Heart, Sliders, Grid, List, TrendingUp, Percent, Edit, Trash, Plus, ChevronRight, User, CreditCard } from 'lucide-react';
import SupplierHeader from '@/components/SupplierHeader';
import Footer from '@/components/Footer';

export default function SupplierRawMaterialsPage() {
  const router = useRouter();
  const [rawMaterials, setRawMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [supplier, setSupplier] = useState(null);
  const filterPanelRef = useRef(null);
  
  // Filter states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [ratings, setRatings] = useState(0); // Minimum rating filter
  const [discount, setDiscount] = useState(false); // Show only discounted items
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [activeFilters, setActiveFilters] = useState(0);
  const [deleteRawMaterialId, setDeleteRawMaterialId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Animation states
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);

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
        
        // Fetch supplier's raw materials
        const response = await fetch(`/api/supplier/rawmaterials?supplierId=${authData.supplier.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch raw materials');
        }

        setRawMaterials(data.rawMaterials || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.rawMaterials.map(material => material.category))];
        setCategories(uniqueCategories);
        
        // Extract subcategories grouped by category
        const subcategoryMap = {};
        uniqueCategories.forEach(category => {
          const materialsInCategory = data.rawMaterials.filter(material => material.category === category);
          const uniqueSubcategories = [...new Set(materialsInCategory.map(material => 
            material.subcategory).filter(Boolean))];
          subcategoryMap[category] = uniqueSubcategories;
        });
        setSubcategories(subcategoryMap);
        
      } catch (error) {
        console.error('Fetch raw materials error:', error);
        setError('Failed to load raw materials. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetch();
    
    // Close filter panel when clicking outside
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('button[data-filter-toggle]')) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);
  
  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setSelectedSubcategory('all');
    }
  }, [selectedCategory]);
  
  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedSubcategory !== 'all') count++;
    if (searchQuery) count++;
    if (priceRange.min > 0 || priceRange.max < 20000) count++;
    if (ratings > 0) count++;
    if (discount) count++;
    if (selectedFeatures.length > 0) count++;
    
    setActiveFilters(count);
  }, [selectedCategory, selectedSubcategory, searchQuery, priceRange, ratings, discount, selectedFeatures]);
  
  const handleDeleteRawMaterial = async () => {
    if (!deleteRawMaterialId) return;
    
    try {
      const response = await fetch(`/api/supplier/rawmaterials?id=${deleteRawMaterialId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete raw material');
      }
      
      // Remove raw material from state
      setRawMaterials(rawMaterials.filter(material => material._id !== deleteRawMaterialId));
      showToast('Raw material deleted successfully', 'success');
    } catch (error) {
      console.error('Delete raw material error:', error);
      showToast(error.message || 'Failed to delete raw material', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteRawMaterialId(null);
    }
  };

  const confirmDeleteRawMaterial = (materialId) => {
    setDeleteRawMaterialId(materialId);
    setIsDeleteModalOpen(true);
  };

  const handleShare = (material) => {
    if (navigator.share) {
      navigator.share({
        title: material.name,
        text: `Check out this ${material.name}!`,
        url: window.location.origin + `/rawmaterials/${material._id}`
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `${window.location.origin}/rawmaterials/${material._id}`;
      prompt('Copy this link to share:', shareUrl);
    }
  };
  
  // Toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up ${
      type === 'success' ? 'bg-teal-600' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };
  
  // Filter functions
  const filterRawMaterials = useCallback(() => {
    if (!rawMaterials.length) return [];
    
    return rawMaterials.filter(material => {
      // Category filter
      if (selectedCategory !== 'all' && material.category !== selectedCategory) {
        return false;
      }
      
      // Subcategory filter
      if (selectedSubcategory !== 'all' && material.subcategory !== selectedSubcategory) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !material.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !material.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Price filter
      if (material.price < priceRange.min || material.price > priceRange.max) {
        return false;
      }
      
      // Rating filter
      if (ratings > 0 && material.ratings < ratings) {
        return false;
      }
      
      // Discount filter
      if (discount && (!material.discount || material.discount <= 0)) {
        return false;
      }
      
      // Feature filter
      if (selectedFeatures.length > 0 && !selectedFeatures.some(feature => 
        material.features && material.features.includes(feature))) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort materials
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.ratings - a.ratings;
        case 'popularity':
          return b.numReviews - a.numReviews;
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [rawMaterials, selectedCategory, selectedSubcategory, searchQuery, priceRange, sortBy, ratings, discount, selectedFeatures]);
  
  const filteredRawMaterials = filterRawMaterials();
  
  // Group materials by supplier and category and subcategory (same logic as user page)
  const groupedMaterials = useCallback(() => {
    const grouped = {};
    
    // Since this is supplier page, all materials are from the same supplier
    const supplierName = supplier?.supplierName || 'My Materials';
    
    if (selectedCategory !== 'all') {
      // Group by subcategory when a specific category is selected
      grouped[supplierName] = {};
      grouped[supplierName][selectedCategory] = {};
      
      if (selectedSubcategory !== 'all') {
        // Only show selected subcategory
        const materialsInSubcategory = filteredRawMaterials.filter(m => m.subcategory === selectedSubcategory);
        if (materialsInSubcategory.length > 0) {
          grouped[supplierName][selectedCategory][selectedSubcategory] = materialsInSubcategory;
        }
      } else {
        // Group by all subcategories in the category
        const subcategoriesInCategory = [...new Set(filteredRawMaterials
          .filter(m => m.category === selectedCategory)
          .map(m => m.subcategory).filter(Boolean))];
        
        subcategoriesInCategory.forEach(subcategory => {
          const materialsInSubcategory = filteredRawMaterials.filter(m => 
            m.subcategory === subcategory && m.category === selectedCategory
          );
          if (materialsInSubcategory.length > 0) {
            grouped[supplierName][selectedCategory][subcategory] = materialsInSubcategory;
          }
        });
      }
    } else {
      // Group by category first, then by subcategory
      grouped[supplierName] = {};
      
      categories.forEach(category => {
        const materialsInCategory = filteredRawMaterials.filter(m => m.category === category);
        
        if (materialsInCategory.length > 0) {
          grouped[supplierName][category] = {};
          
          // Group by subcategories within each category
          const subcategoriesInCategory = [...new Set(materialsInCategory.map(m => m.subcategory).filter(Boolean))];
          subcategoriesInCategory.forEach(subcategory => {
            const materialsInSubcategory = materialsInCategory.filter(m => m.subcategory === subcategory);
            if (materialsInSubcategory.length > 0) {
              grouped[supplierName][category][subcategory] = materialsInSubcategory;
            }
          });
        }
      });
    }
    
    return grouped;
  }, [filteredRawMaterials, selectedCategory, selectedSubcategory, categories, supplier]);
  
  const materialsBySupplier = groupedMaterials();
  
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
    setPriceRange({ min: 0, max: 20000 });
    setSortBy('newest');
    setRatings(0);
    setDiscount(false);
    setSelectedFeatures([]);
    
    // Animation for filter reset
    setIsFilterAnimating(true);
    setTimeout(() => setIsFilterAnimating(false), 500);
  };
  
  const handleFeatureToggle = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-teal-700 animate-pulse">Loading raw materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <X size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
          <p className="text-gray-600 mb-6">We couldn't load the raw materials. Please try again later.</p>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
      <SupplierHeader />
      
      <div className="container mx-auto px-4 pb-16">
        {/* Page Header - Updated to match user page style */}
        <div className="py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Raw Materials Marketplace</h1>
              <p className="text-gray-600">Manage your raw materials and track their performance</p>
            </div>
            <Link 
              href="/supplier/add-raw-material" 
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md transition-colors shadow-md"
            >
              <Plus size={18} />
              <span>Add New Material</span>
            </Link>
          </div>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar - Same as user page */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <Sliders size={18} className="mr-2 text-teal-600" />
                  Filters
                </h2>
                {activeFilters > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedCategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
                      }}
                    >
                      <Package size={16} className="mr-2" />
                      <span>All Categories</span>
                    </div>
                    {categories.map(category => (
                      <div key={category}>
                        <div 
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedCategory === category ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedSubcategory('all');
                          }}
                        >
                          <span>{category}</span>
                        </div>
                        
                        {/* Subcategories */}
                        {selectedCategory === category && subcategories[category] && subcategories[category].length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            <div
                              className={`flex items-center px-3 py-1 text-sm rounded-md cursor-pointer ${selectedSubcategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedSubcategory('all')}
                            >
                              <span>All {category}</span>
                            </div>
                            {subcategories[category].map(subcategory => (
                              <div 
                                key={subcategory}
                                className={`flex items-center px-3 py-1 text-sm rounded-md cursor-pointer ${selectedSubcategory === subcategory ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedSubcategory(subcategory)}
                              >
                                <ChevronRight size={12} className="mr-1" />
                                <span>{subcategory}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                  <div className="px-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-full">
                        <input
                          type="range"
                          min="0"
                          max="20000"
                          step="100"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 20000 })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ratings */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Ratings</h3>
                  <div className="space-y-2">
                    {[0, 4, 3, 2, 1].map((rating) => (
                      <div 
                        key={rating}
                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${ratings === rating ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                        onClick={() => setRatings(rating)}
                      >
                        {rating === 0 ? (
                          <span>All Ratings</span>
                        ) : (
                          <>
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < rating ? "currentColor" : "none"} 
                                  stroke="currentColor" 
                                />
                              ))}
                            </div>
                            <span>& Up</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Special Filters */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Special Filters</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="discount-filter"
                        checked={discount}
                        onChange={() => setDiscount(!discount)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="discount-filter" className="ml-2 text-sm text-gray-700 cursor-pointer flex items-center">
                        <Percent size={14} className="mr-1 text-red-500" />
                        Discounted Items
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and filter bar - Same as user page */}
            <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search raw materials..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter toggle (mobile) */}
                <button
                  data-filter-toggle="true"
                  className="lg:hidden flex items-center justify-center space-x-2 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
                  onClick={toggleFilterPanel}
                >
                  <Filter size={18} />
                  <span>Filters {activeFilters > 0 && `(${activeFilters})`}</span>
                </button>
                
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>
                
                {/* View mode toggle */}
                <div className="hidden md:flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filter Panel (mobile) - Same as user page */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex justify-end">
                <div 
                  ref={filterPanelRef}
                  className="w-full max-w-xs bg-white h-full overflow-y-auto shadow-xl animate-slide-in-right"
                >
                  <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <Sliders size={18} className="mr-2 text-teal-600" />
                      Filters
                    </h2>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Mobile filters - same as desktop */}
                    {/* Categories */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
                      <div className="space-y-2">
                        <div 
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedCategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedSubcategory('all');
                          }}
                        >
                          <Package size={16} className="mr-2" />
                          <span>All Categories</span>
                        </div>
                        
                        {categories.map(category => (
                          <div key={category}>
                            <div 
                              className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedCategory === category ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedSubcategory('all');
                              }}
                            >
                              <span>{category}</span>
                            </div>
                            
                            {/* Subcategories for mobile */}
                            {selectedCategory === category && subcategories[category] && subcategories[category].length > 0 && (
                              <div className="ml-6 mt-2 space-y-1">
                                <div
                                  className={`flex items-center px-3 py-1 text-sm rounded-md cursor-pointer ${selectedSubcategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                                  onClick={() => setSelectedSubcategory('all')}
                                >
                                  <span>All {category}</span>
                                </div>
                                {subcategories[category].map(subcategory => (
                                  <div 
                                    key={subcategory}
                                    className={`flex items-center px-3 py-1 text-sm rounded-md cursor-pointer ${selectedSubcategory === subcategory ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedSubcategory(subcategory)}
                                  >
                                    <ChevronRight size={12} className="mr-1" />
                                    <span>{subcategory}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t sticky bottom-0 bg-white flex justify-between">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter chips - Same as user page */}
            <div className={`flex flex-wrap gap-2 mb-6 ${isFilterAnimating ? 'animate-pulse' : ''}`}>
              {selectedCategory !== 'all' && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Category: {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {selectedSubcategory !== 'all' && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Subcategory: {selectedSubcategory}
                  <button 
                    onClick={() => setSelectedSubcategory('all')}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {searchQuery && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {(priceRange.min > 0 || priceRange.max < 20000) && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Price: ₹{priceRange.min} - ₹{priceRange.max}
                  <button 
                    onClick={() => setPriceRange({ min: 0, max: 20000 })}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {ratings > 0 && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {ratings}+ Stars
                  <button 
                    onClick={() => setRatings(0)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {discount && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Discounted
                  <button 
                    onClick={() => setDiscount(false)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {selectedFeatures.length > 0 && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Features: {selectedFeatures.length}
                  <button 
                    onClick={() => setSelectedFeatures([])}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-teal-600 underline text-sm hover:text-teal-800"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            {/* Empty state */}
            {filteredRawMaterials.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                {rawMaterials.length === 0 ? (
                  // No materials at all
                  <>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No raw materials available</h2>
                    <p className="text-gray-500 mb-6">You haven't added any raw materials yet. Start by adding your first material!</p>
                    <Link 
                      href="/supplier/add-raw-material"
                      className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md"
                    >
                      <Plus size={18} className="mr-2" />
                      Add Your First Material
                    </Link>
                  </>
                ) : (
                  // Materials exist but none match filters
                  <>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No raw materials found</h2>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Materials by supplier and category and subcategory - Same structure as user page */
              <div className="space-y-10">
                {Object.entries(materialsBySupplier).map(([supplierName, categoryGroups]) => (
                  <div key={`supplier-${supplierName}`} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Supplier header - Modified for supplier view */}
                    <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-4 text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <User size={20} className="mr-3" />
                        <h2 className="text-xl font-bold">{supplierName}</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm bg-white text-teal-700 px-3 py-1 rounded-full">
                          {filteredRawMaterials.length} materials
                        </span>
                      </div>
                    </div>
                    
                    {/* Categories under supplier */}
                    <div className="p-4 space-y-8">
                      {Object.entries(categoryGroups).map(([category, subcategoryGroups]) => (
                        <div key={`${supplierName}-${category}`} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                          {/* Category header */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                              <Tag size={16} className="mr-2 text-teal-600" />
                              {category}
                              <span className="ml-2 text-sm text-gray-500">
                                ({Object.values(subcategoryGroups).reduce((acc, materials) => acc + materials.length, 0)} items)
                              </span>
                            </h3>
                            
                            {selectedCategory !== category && (
                              <button 
                                onClick={() => {
                                  setSelectedCategory(category);
                                }}
                                className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                              >
                                View All
                                <ArrowUpRight size={14} className="ml-1" />
                              </button>
                            )}
                          </div>
                          
                          {/* Subcategories under category */}
                          <div className="space-y-6">
                            {Object.entries(subcategoryGroups).map(([subcategory, materials]) => (
                              <div key={`${supplierName}-${category}-${subcategory}`} className="ml-4">
                                {/* Subcategory header */}
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-md font-medium text-gray-700 flex items-center">
                                    <Package size={14} className="mr-2 text-gray-500" />
                                    {subcategory}
                                    <span className="ml-2 text-sm text-gray-400">({materials.length} items)</span>
                                  </h4>
                                  
                                  {selectedSubcategory !== subcategory && (
                                    <button 
                                      onClick={() => {
                                        setSelectedSubcategory(subcategory);
                                      }}
                                      className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
                                    >
                                      View All
                                      <ArrowUpRight size={12} className="ml-1" />
                                    </button>
                                  )}
                                </div>
                        
                                {/* Materials grid or list */}
                                {viewMode === 'grid' ? (
                                  // Grid View - Same as user page but with supplier actions
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {materials.map((material, index) => (
                                      <div key={`${material._id}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group max-w-md mx-auto">
                                        <div 
                                          className="h-56 bg-gray-100 relative cursor-pointer overflow-hidden"
                                          onClick={() => router.push(`/supplier/rawmaterials/${material._id}`)}
                                        >
                                          <img 
                                            src={material.mainImage || material.images?.[0]?.url || "/placeholder.svg"} 
                                            alt={material.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                          
                                          {material.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                              {material.discount}% OFF
                                            </div>
                                          )}
                                          
                                          {/* Supplier action buttons */}
                                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                              href={`/supplier/rawmaterials/${material._id}/edit`}
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                            >
                                              <Edit size={14} className="text-teal-600" />
                                            </Link>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDeleteRawMaterial(material._id);
                                              }}
                                              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                            >
                                              <Trash size={14} className="text-red-600" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleShare(material);
                                              }}
                                              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                            >
                                              <Share size={14} className="text-gray-600" />
                                            </button>
                                          </div>
                                        </div>
                                        
                                        <div className="p-5">
                                          <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 text-lg">{material.name}</h3>
                                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                                          
                                          <div className="flex items-center mb-2">
                                            <div className="flex text-yellow-400">
                                              {[...Array(5)].map((_, i) => (
                                                <Star 
                                                  key={`${material._id}-star-${i}`}
                                                  size={14} 
                                                  fill={i < Math.round(material.ratings || 0) ? "currentColor" : "none"}
                                                  stroke="currentColor" 
                                                />
                                              ))}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-1">
                                              {material.ratings ? material.ratings.toFixed(1) : '0.0'} ({material.numReviews || 0})
                                            </span>
                                          </div>
                                          
                                          <div className="flex flex-col space-y-3">
                                            <div className="flex items-center justify-between">
                                              <div className="flex flex-col">
                                                <span className="text-lg font-bold text-gray-900">₹{material.price.toLocaleString()}</span>
                                                {material.originalPrice && material.originalPrice > material.price && (
                                                  <span className="text-sm text-gray-500 line-through">₹{material.originalPrice.toLocaleString()}</span>
                                                )}
                                              </div>
                                              
                                              <div className="flex items-center">
                                                {material.quantity > 0 ? (
                                                  <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                                    {material.quantity} in stock
                                                  </div>
                                                ) : (
                                                  <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">
                                                    Out of stock
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                              <Link
                                                href={`/supplier/rawmaterials/${material._id}`}
                                                className="flex-1 bg-teal-600 text-white py-2 px-3 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center space-x-1"
                                              >
                                                <span className="text-sm">View Details</span>
                                              </Link>
                                              <Link
                                                href={`/supplier/rawmaterials/${material._id}/edit`}
                                                className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                                              >
                                                <Edit size={16} />
                                              </Link>
                                              <button
                                                onClick={() => confirmDeleteRawMaterial(material._id)}
                                                className="bg-red-50 text-red-600 py-2 px-3 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center"
                                              >
                                                <Trash size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  // List View - Same as user page but with supplier actions
                                  <div className="space-y-6">
                                    {materials.map((material, index) => (
                                      <div key={`${material._id}-list-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col sm:flex-row max-w-4xl mx-auto">
                                        <div 
                                          className="sm:w-56 h-48 sm:h-36 bg-gray-100 relative cursor-pointer overflow-hidden flex-shrink-0"
                                          onClick={() => router.push(`/supplier/rawmaterials/${material._id}`)}
                                        >
                                          <img 
                                            src={material.mainImage || material.images?.[0]?.url || "/placeholder.svg"} 
                                            alt={material.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                          
                                          {material.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                              {material.discount}% OFF
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 p-5 flex flex-col justify-between">
                                          <div>
                                            <h3 className="font-semibold text-gray-800 mb-3 text-lg">{material.name}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                                            
                                            <div className="flex items-center mb-2">
                                              <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                  <Star 
                                                    key={`${material._id}-list-star-${i}`}
                                                    size={14} 
                                                    fill={i < Math.round(material.ratings || 0) ? "currentColor" : "none"}
                                                    stroke="currentColor" 
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-xs text-gray-500 ml-1">
                                                {material.ratings ? material.ratings.toFixed(1) : '0.0'} ({material.numReviews || 0})
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center justify-between mt-4">
                                            <div className="flex flex-col">
                                              <span className="text-lg font-bold text-gray-900">₹{material.price.toLocaleString()}</span>
                                              {material.originalPrice && material.originalPrice > material.price && (
                                                <span className="text-sm text-gray-500 line-through">₹{material.originalPrice.toLocaleString()}</span>
                                              )}
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                              <Link
                                                href={`/supplier/rawmaterials/${material._id}`}
                                                className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-1"
                                              >
                                                <span className="text-sm">View Details</span>
                                              </Link>
                                              <Link
                                                href={`/supplier/rawmaterials/${material._id}/edit`}
                                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                                              >
                                                <Edit size={16} />
                                              </Link>
                                              <button
                                                onClick={() => confirmDeleteRawMaterial(material._id)}
                                                className="bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center space-x-1"
                                              >
                                                <Trash size={16} />
                                              </button>
                                              <button
                                                onClick={() => handleShare(material)}
                                                className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition-colors"
                                              >
                                                <Share size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Raw Material</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this raw material? This will remove it from your listings and it will no longer be visible to customers.
              </p>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteRawMaterialId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRawMaterial}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
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
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}