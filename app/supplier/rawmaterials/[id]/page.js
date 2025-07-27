"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Star,
  ShoppingCart,
  Share,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Check,
  Truck,
  Shield,
  RefreshCw,
  Info,
  Bookmark,
  MessageCircle,
  Edit,
  ArrowLeft,
  Tag,
  Building,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone
} from "lucide-react"
import { use } from "react"
import SupplierHeader from '@/components/SupplierHeader'
import Footer from '@/components/Footer'

export default function SupplierRawMaterialDetailPage({ params }) {
  const router = useRouter()
  // Use React.use() to unwrap params
  const unwrappedParams = use(params)
  const { id } = unwrappedParams

  const [material, setMaterial] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState("")
  const [activeTab, setActiveTab] = useState("reviews")
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [supplier, setSupplier] = useState(null)
  const imageRef = useRef(null)

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
        const response = await fetch(`/api/rawmaterials/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch raw material")
        }

        // Check if this material belongs to the current supplier
        if (data.rawMaterial.createdBy._id !== authData.supplier.id) {
          setError("You don't have permission to view this material")
          return
        }

        setMaterial(data.rawMaterial)
        setIsLoading(false)
      } catch (error) {
        console.error("Fetch raw material error:", error)
        setError("Failed to load raw material. Please try again.")
        setIsLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true)
        const response = await fetch(`/api/rawmaterials/${id}/reviews`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch reviews")
        }

        setReviews(data.reviews)
      } catch (error) {
        console.error("Fetch reviews error:", error)
        setReviewsError("Failed to load reviews. Please try again.")
      } finally {
        setIsLoadingReviews(false)
      }
    }

    if (id) {
      checkAuthAndFetch()
      fetchReviews()
    }
  }, [id, router])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: material.name,
          text: `Check out this ${material.name}!`,
          url: window.location.origin + `/rawmaterials/${material._id}`,
        })
        .catch((error) => console.error("Error sharing:", error))
    } else {
      prompt("Copy this link to share:", window.location.origin + `/rawmaterials/${material._id}`)
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % material.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + material.images.length) % material.images.length)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleImageZoom = (e) => {
    if (!imageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    setZoomPosition({ x, y })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <SupplierHeader />
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-teal-700 animate-pulse">Loading raw material details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <SupplierHeader />
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <Info size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-500 text-lg font-semibold mb-4">{error || "Raw material not found"}</p>
            <p className="text-gray-600 mb-6">We couldn&apos;t load the raw material. Please try again later.</p>
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
    )
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
                onClick={() => router.push("/supplier/rawmaterials")}
                className="text-gray-600 hover:text-gray-800 mr-4 flex items-center"
              >
                <ArrowLeft size={18} className="mr-1" />
                <span>Back to Materials</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Viewing Material</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => router.push(`/supplier/rawmaterials/${id}/edit`)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
              >
                <Edit size={18} className="mr-2" />
                Edit Material
              </button>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/supplier/rawmaterials" className="hover:text-teal-600 transition-colors">
                Supplier
              </Link>
              <span className="mx-2">/</span>
              <Link href="/supplier/rawmaterials" className="hover:text-teal-600 transition-colors">
                Raw Materials
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium truncate">{material.name}</span>
            </div>
          </div>

          {/* Material Overview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              {/* Left: Material Images */}
              <div className="md:w-1/2 bg-white border-r border-gray-100">
                <div className="relative h-80 md:h-[500px] bg-gray-50 flex items-center justify-center overflow-hidden">
                  <div
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                    onMouseMove={handleImageZoom}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    ref={imageRef}
                  >
                    <Image
                      src={material.images[selectedImage].url || "/placeholder.svg"}
                      alt={material.name}
                      width={500}
                      height={500}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                    />

                    {isZoomed && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                          src={material.images[selectedImage].url || "/placeholder.svg"}
                          alt={material.name}
                          width={1000}
                          height={1000}
                          className="absolute w-[200%] h-[200%] max-w-none object-contain"
                          style={{
                            transform: `translate(-${zoomPosition.x * 50}%, -${zoomPosition.y * 50}%)`,
                            transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image navigation arrows */}
                  {material.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Discount badge */}
                  {material.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
                      {material.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail images */}
                {material.images.length > 1 && (
                  <div className="flex overflow-x-auto p-4 space-x-3 bg-white">
                    {material.images.map((image, index) => (
                      <div
                        key={index}
                        className={`w-20 h-20 flex-shrink-0 border-2 rounded-md cursor-pointer overflow-hidden ${
                          index === selectedImage
                            ? "border-teal-500 shadow-md"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={`${material.name} thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Material Details */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                {/* Category and Subcategory */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      {material.category}
                    </span>
                  </div>
                  
                  {material.subcategory && (
                    <div className="flex items-center">
                      <ChevronRight size={14} className="text-gray-400 mx-1" />
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center">
                        <Tag size={12} className="mr-1" />
                        {material.subcategory}
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{material.name}</h1>

                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < Math.floor(material.ratings || 0) ? "currentColor" : "none"}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{material.ratings?.toFixed(1) || "0.0"}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <button onClick={() => setActiveTab("reviews")} className="text-sm text-teal-600 hover:underline">
                    {material.numReviews || 0} {material.numReviews === 1 ? "review" : "reviews"}
                  </button>
                </div>

                <div className="flex items-end mb-6">
                  <span className="text-3xl font-bold text-gray-900">₹{material.price.toLocaleString()}</span>
                  {material.originalPrice && material.originalPrice > material.price && (
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm text-gray-500 line-through">
                        ₹{material.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Save ₹{(material.originalPrice - material.price).toLocaleString()} (
                        {Math.round(((material.originalPrice - material.price) / material.originalPrice) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Short description */}
                <div className="mb-6">
                  <p className="text-gray-600">{material.description}</p>
                </div>

                {/* Availability */}
                <div className="mb-6 flex items-center">
                  {material.quantity > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600 font-medium">In Stock</span>
                      <span className="text-gray-500 ml-2">({material.quantity} available)</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={() => router.push(`/supplier/rawmaterials/${id}/edit`)}
                    className="flex-1 py-3 px-6 rounded-md flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Material
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <Share size={18} />
                  </button>
                </div>

                {/* Supplier info panel */}
                <div className="mt-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                    <Info size={18} className="mr-2" />
                    Material Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material ID:</span>
                      <span className="font-mono">{material._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created At:</span>
                      <span>{new Date(material.createdAt).toLocaleString()}</span>
                    </div>
                    {material.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span>{new Date(material.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={material.isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {material.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Material Details Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === "reviews"
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({material.numReviews || 0})
                </button>
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === "description"
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Description
                </button>
                {material.features && material.features.length > 0 && (
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                      activeTab === "features"
                        ? "text-teal-600 border-b-2 border-teal-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Features
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === "analytics"
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  {/* Review Summary */}
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <div className="md:flex items-start">
                      <div className="md:w-1/3 mb-6 md:mb-0">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900 mb-2">
                            {material.ratings?.toFixed(1) || "0.0"}
                          </div>
                          <div className="flex justify-center text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                fill={i < Math.floor(material.ratings || 0) ? "currentColor" : "none"}
                                stroke="currentColor"
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">Based on {material.numReviews || 0} reviews</div>
                        </div>
                      </div>

                      <div className="md:w-2/3 md:pl-8 md:border-l border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((review) => review.rating === star).length
                          const percentage = material.numReviews ? Math.round((count / material.numReviews) * 100) : 0

                          return (
                            <div key={star} className="flex items-center mb-2">
                              <div className="flex items-center w-16">
                                <span className="text-sm font-medium mr-2">{star}</span>
                                <Star size={14} className="text-yellow-400" fill="currentColor" />
                              </div>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-16 text-right text-sm text-gray-500">{percentage}%</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MessageCircle size={18} className="mr-2 text-teal-600" />
                      {reviews.length === 0 ? "No Reviews Yet" : `Customer Reviews (${reviews.length})`}
                    </h3>

                    {isLoadingReviews ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                      </div>
                    ) : reviewsError ? (
                      <div className="p-4 bg-red-50 text-red-700 text-sm rounded-md">{reviewsError}</div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Bookmark size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-4">No reviews yet</p>
                        <p className="text-sm text-gray-400">Share this material link to get customer feedback!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-3">
                                {review.userProfilePicture ? (
                                  <Image
                                    src={review.userProfilePicture || "/placeholder.svg"}
                                    alt={review.userName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{review.userName}</p>
                                <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                              </div>

                              {review.verifiedPurchase && (
                                <div className="ml-auto bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                                  <Check size={12} className="mr-1" />
                                  Verified Purchase
                                </div>
                              )}
                            </div>

                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className="text-yellow-400"
                                  fill={i < review.rating ? "currentColor" : "none"}
                                />
                              ))}
                            </div>

                            {review.title && (
                              <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                            )}

                            <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{material.description}</p>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === "features" && material.features && (
                <div>
                  <ul className="space-y-3">
                    {material.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={18} className="text-teal-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Material Performance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Reviews</p>
                          <p className="text-2xl font-bold text-blue-900">{material.numReviews || 0}</p>
                        </div>
                        <MessageCircle size={24} className="text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Average Rating</p>
                          <p className="text-2xl font-bold text-green-900">{material.ratings?.toFixed(1) || '0.0'}</p>
                        </div>
                        <Star size={24} className="text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Stock Level</p>
                          <p className="text-2xl font-bold text-orange-900">{material.quantity}</p>
                        </div>
                        <Package size={24} className="text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(material.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{material.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subcategory:</span>
                        <span className="font-medium">{material.subcategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${material.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {material.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}