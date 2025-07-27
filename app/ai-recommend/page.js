"use client"

import { useState } from 'react';
import { Search, Star, MapPin, Percent, Package, ShoppingCart, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AIRecommendPage() {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage('Please enter raw material names');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Failed to get recommendations');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Network error. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (materialId, quantity = 1) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rawMaterialId: materialId,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Added to cart successfully!');
      } else {
        alert(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="mr-2" style={{color: '#347433'}} size={32} />
              <h1 className="text-3xl font-bold text-gray-800">AI Recommendations</h1>
            </div>
            <p className="text-gray-600">
              Tell us what raw materials you need, and our AI will find the best suppliers for you
            </p>
          </div>

          {/* Search Input */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What raw materials do you need?
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., tomatoes, onions, rice, wheat flour..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#347433'}}
                  onFocus={(e) => e.target.style.borderColor = '#347433'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 <strong>Note:</strong> Search for raw materials that exist in our platform. Try: paneer, butter, rice, tomatoes, onions, flour, oil, spices, etc.
                </p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  style={{backgroundColor: '#347433'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Search size={20} />
                  )}
                  {loading ? 'Searching...' : 'Find Best Suppliers'}
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${recommendations.length > 0 ? 'text-green-800' : 'bg-blue-50 text-blue-800'}`}
                 style={recommendations.length > 0 ? {backgroundColor: '#f0f9f0'} : {}}>
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-6">
              {recommendations.map((rec, index) => {
                const material = rec.recommendedMaterial;
                const supplier = material.createdBy;
                
                return (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Search Term Header */}
                    <div className="px-6 py-3 border-b" style={{backgroundColor: '#f0f9f0'}}>
                      <h3 className="font-semibold" style={{color: '#2d5f2d'}}>
                        Best match for: <span style={{color: '#347433'}}>"{rec.searchTerm}"</span>
                      </h3>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Product Image */}
                        <div className="lg:w-1/4">
                          <img
                            src={material.mainImage || `https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=${encodeURIComponent(material.name)}`}
                            alt={material.name}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=${encodeURIComponent(material.name)}`;
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="lg:w-1/2">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{material.name}</h4>
                          <p className="text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                          
                          {/* Supplier Info */}
                          <div className="mb-3">
                            <p className="font-medium text-gray-700">{supplier?.supplierName}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin size={14} className="mr-1" />
                              <span>{supplier?.businessAddress}</span>
                            </div>
                          </div>

                          {/* Ratings & Reviews */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center">
                              <Star className="text-yellow-400 fill-current" size={16} />
                              <span className="ml-1 font-medium">{material.ratings || 0}</span>
                              <span className="text-gray-500 text-sm ml-1">({material.numReviews || 0} reviews)</span>
                            </div>
                            {material.discount > 0 && (
                              <div className="flex items-center" style={{color: '#347433'}}>
                                <Percent size={14} className="mr-1" />
                                <span className="font-medium">{material.discount}% OFF</span>
                              </div>
                            )}
                          </div>

                          {/* AI Recommendation Reason */}
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-blue-800">
                              <Sparkles size={14} className="inline mr-1" />
                              <strong>Why recommended:</strong> {material.reasonForRecommendation}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              AI Score: {material.aiScore}/100 • Distance: ~{material.distance}km
                            </p>
                          </div>

                          {/* Stock Info */}
                          <div className="flex items-center text-sm text-gray-600">
                            <Package size={14} className="mr-1" />
                            <span>{material.quantity} units available</span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="lg:w-1/4 flex flex-col justify-between">
                          <div>
                            <div className="text-right mb-4">
                              {material.originalPrice && material.originalPrice > material.price && (
                                <p className="text-gray-400 line-through text-sm">₹{material.originalPrice.toLocaleString()}</p>
                              )}
                              <p className="text-2xl font-bold" style={{color: '#347433'}}>₹{material.price.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">per unit</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button
                              onClick={() => handleAddToCart(material._id, 1)}
                              className="w-full text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                              style={{backgroundColor: '#347433'}}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
                            >
                              <ShoppingCart size={16} />
                              Add to Cart
                            </button>
                            
                            <a
                              href={`/rawmaterials/${material._id}`}
                              className="w-full border py-2 px-4 rounded-lg transition-colors text-center block"
                              style={{borderColor: '#347433', color: '#347433'}}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9f0'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Alternatives */}
                      {rec.alternatives && rec.alternatives.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-3">Other options:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {rec.alternatives.slice(0, 2).map((alt, altIndex) => (
                              <div key={altIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{alt.name}</p>
                                  <p className="text-xs text-gray-500">{alt.createdBy?.supplierName}</p>
                                  <div className="flex items-center mt-1">
                                    <Star className="text-yellow-400 fill-current" size={12} />
                                    <span className="text-xs ml-1">{alt.ratings || 0}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold" style={{color: '#347433'}}>₹{alt.price.toLocaleString()}</p>
                                  <button
                                    onClick={() => handleAddToCart(alt._id, 1)}
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && recommendations.length === 0 && query && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No recommendations found</h3>
              <p className="text-gray-500">Try different keywords or check our full catalog</p>
              <a
                href="/rawmaterials"
                className="inline-block mt-4 px-6 py-2 text-white rounded-lg"
                style={{backgroundColor: '#347433'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5f2d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#347433'}
              >
                Browse All Materials
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}