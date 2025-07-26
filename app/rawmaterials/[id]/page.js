"use client";

import {
  Bookmark,
  Building,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  Heart,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Share,
  Shield,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

export default function RawMaterialDetailPage({ params }) {
  const router = useRouter()
  // Use React.use() to unwrap params
  const unwrappedParams = use(params)
  const { id } = unwrappedParams

  const [rawMaterial, setRawMaterial] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [loadAttempts, setLoadAttempts] = useState(0)
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState("")
  const [activeTab, setActiveTab] = useState("reviews")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", title: "" })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSubmitError, setReviewSubmitError] = useState("")
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState("")
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userReviewId, setUserReviewId] = useState(null)
  
  // Edit review states
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 5, comment: "", title: "" })

  // Function to refresh both material and reviews data
  const refreshData = async () => {
    try {
      console.log("Refreshing data...") // Debug log
      
      // Fetch updated material data
      const materialResponse = await fetch(`/api/rawmaterials/${id}`)
      if (materialResponse.ok) {
        const materialData = await materialResponse.json()
        if (materialData.success && materialData.rawMaterial) {
          setRawMaterial(materialData.rawMaterial)
          console.log("Material updated:", materialData.rawMaterial.ratings, materialData.rawMaterial.numReviews) // Debug log
        }
      }

      // Fetch updated reviews
      const reviewsResponse = await fetch(`/api/rawmaterials/${id}/reviews`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        console.log("Reviews response:", reviewsData); // Debug log
        if (reviewsData.success && reviewsData.reviews) {
          setReviews(reviewsData.reviews)
          console.log("Reviews fetched:", reviewsData.reviews.length) // Debug log
          
          // Check if current user has reviewed
          if (currentUser) {
            const userReview = reviewsData.reviews.find((review) => 
              review.userId && currentUser.id && 
              review.userId.toString() === currentUser.id.toString()
            )
            console.log("User review after refresh:", userReview) // Debug log
            setHasUserReviewed(!!userReview)
            setUserReviewId(userReview ? userReview._id : null)
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  useEffect(() => {
    const fetchRawMaterial = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/rawmaterials/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch raw material: ${response.status}`)
        }
        
        const data = await response.json()

        if (!data.success || !data.rawMaterial) {
          throw new Error('Raw material data not found')
        }

        setRawMaterial(data.rawMaterial)
        setError("")
        setIsLoading(false)

        // Check if material is in favorites
        const savedFavorites = localStorage.getItem("rawMaterialFavorites")
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites)
          setIsFavorite(favorites.includes(data.rawMaterial._id))
        }
      } catch (error) {
        console.error("Fetch raw material error:", error)
        setError("Failed to load raw material. Please try again.")
        
        if (loadAttempts < 3) {
          setTimeout(() => {
            setLoadAttempts(prev => prev + 1)
          }, 1000)
        }
        
        setIsLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        console.log('Fetching reviews for material:', id); // Debug log
        setIsLoadingReviews(true)
        const response = await fetch(`/api/rawmaterials/${id}/reviews`)
        const data = await response.json()

        console.log('Reviews API response:', data); // Debug log

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch reviews")
        }

        if (data.success) {
          setReviews(data.reviews || [])

          // Check current user and if they have reviewed
          try {
            const userResponse = await fetch("/api/auth/user")
            if (userResponse.ok) {
              const userData = await userResponse.json()
              console.log('Current user data:', userData); // Debug log
              if (userData.success && userData.user) {
                setCurrentUser(userData.user)
                const userReview = (data.reviews || []).find((review) => 
                  review.userId && userData.user.id && 
                  review.userId.toString() === userData.user.id.toString()
                )
                console.log("User review found:", userReview) // Debug log
                if (userReview) {
                  setHasUserReviewed(true)
                  setUserReviewId(userReview._id)
                  console.log('User has reviewed - setting hasUserReviewed to true'); // Debug log
                } else {
                  setHasUserReviewed(false)
                  setUserReviewId(null)
                  console.log('User has not reviewed - setting hasUserReviewed to false'); // Debug log
                }
              }
            }
          } catch (userError) {
            console.error("User fetch error:", userError)
          }
        }

      } catch (error) {
        console.error("Fetch reviews error:", error)
        setReviewsError("Failed to load reviews. Please try again.")
      } finally {
        setIsLoadingReviews(false)
      }
    }

    if (id) {
      fetchRawMaterial()
      fetchReviews()
    }
  }, [id, loadAttempts])

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (!response.ok) {
        return false
      }
      const userData = await response.json()
      return userData.success && !!userData.user
    } catch (error) {
      return false
    }
  }

  const handleAddToCart = async () => {
    try {
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/login')
        return
      }
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawMaterialId: rawMaterial._id,
          quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add item to cart")
      }

      showToast("Raw material added to cart!", "success")
    } catch (error) {
      console.error("Add to cart error:", error)
      showToast(error.message || "Failed to add to cart", "error")
    }
  }

  const handleBuyNow = async () => {
    try {
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawMaterialId: rawMaterial._id,
          quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add item to cart")
      }

      router.push('/checkout')
    } catch (error) {
      console.error("Buy now error:", error)
      showToast(error.message || "Failed to process. Please try again.", "error")
    }
  }

  // Toast notification
  const showToast = (message, type = "info") => {
    const toast = document.createElement("div")
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up ${
      type === "success" ? "bg-teal-600" : type === "error" ? "bg-red-600" : "bg-blue-600"
    }`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("animate-fade-out")
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.comment.trim()) {
      setReviewSubmitError("Please enter a review comment")
      return
    }

    if (reviewForm.comment.trim().length < 10) {
      setReviewSubmitError("Comment must be at least 10 characters long")
      return
    }

    if (!currentUser) {
      setReviewSubmitError("Please login to submit a review")
      return
    }

    setIsSubmittingReview(true)
    setReviewSubmitError("")
    setReviewSubmitSuccess("")

    try {
      console.log('Submitting review:', { rating: reviewForm.rating, title: reviewForm.title, comment: reviewForm.comment }); // Debug log

      const response = await fetch(`/api/rawmaterials/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      })

      const data = await response.json()
      console.log('Review submission response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      if (data.success) {
        // Update user review states immediately
        setHasUserReviewed(true)
        setUserReviewId(data.review._id)

        // Refresh all data to ensure consistency
        await refreshData()

        // Reset form and show success message
        setReviewForm({ rating: 5, comment: "", title: "" })
        setReviewSubmitSuccess("Your review has been submitted successfully!")

        showToast("Review submitted successfully!", "success")
      }
    } catch (error) {
      console.error("Submit review error:", error)
      setReviewSubmitError(error.message || "Failed to submit review. Please try again.")
      showToast("Failed to submit review", "error")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review._id)
    setEditForm({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment
    })
  }

  const handleUpdateReview = async (e) => {
    e.preventDefault()

    if (!editForm.comment.trim()) {
      showToast("Please enter a review comment", "error")
      return
    }

    if (editForm.comment.trim().length < 10) {
      showToast("Comment must be at least 10 characters long", "error")
      return
    }

    try {
      console.log('Updating review:', editingReview, editForm); // Debug log
      
      const response = await fetch(`/api/rawmaterials/${id}/reviews`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: editingReview,
          rating: editForm.rating,
          title: editForm.title,
          comment: editForm.comment,
        }),
      })

      const data = await response.json()
      console.log('Update review response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Failed to update review")
      }

      if (data.success) {
        // Refresh all data to ensure consistency
        await refreshData()

        setEditingReview(null)
        showToast("Review updated successfully!", "success")
      }
    } catch (error) {
      console.error("Update review error:", error)
      showToast(error.message || "Failed to update review", "error")
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      console.log('Deleting review:', reviewId); // Debug log
      
      const response = await fetch(`/api/rawmaterials/${id}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      console.log('Delete review response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete review")
      }

      if (data.success) {
        // Reset user review states immediately
        setHasUserReviewed(false)
        setUserReviewId(null)
        
        // Refresh all data to ensure consistency
        await refreshData()

        showToast("Review deleted successfully!", "success")
      }
    } catch (error) {
      console.error("Delete review error:", error)
      showToast(error.message || "Failed to delete review", "error")
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: rawMaterial.name,
          text: `Check out this ${rawMaterial.name}!`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error))
    } else {
      prompt("Copy this link to share:", window.location.href)
    }
  }

  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem("rawMaterialFavorites") || "[]"
    let favorites = JSON.parse(savedFavorites)

    if (isFavorite) {
      favorites = favorites.filter((fav) => fav !== rawMaterial._id)
      showToast("Removed from favorites", "info")
    } else {
      favorites.push(rawMaterial._id)
      showToast("Added to favorites! Favorites are stored locally on this device.", "success")
    }

    localStorage.setItem("rawMaterialFavorites", JSON.stringify(favorites))
    setIsFavorite(!isFavorite)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % rawMaterial.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + rawMaterial.images.length) % rawMaterial.images.length)
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
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-teal-700 animate-pulse">Loading raw material details...</p>
        </div>
      </div>
    )
  }

  if (error || !rawMaterial) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <Info size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-500 text-lg font-semibold mb-4">{error || "Raw material not found"}</p>
          <p className="text-gray-600 mb-6">We couldn&apos;t load the raw material. Please try again later.</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => router.push("/rawmaterials")}
              className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md"
            >
              Back to Raw Materials
            </button>
            <button
              onClick={() => setLoadAttempts(prev => prev + 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <button onClick={() => router.push("/rawmaterials")} className="hover:text-teal-600 transition-colors">
              Raw Materials
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium truncate">{rawMaterial.name}</span>
          </div>
        </div>

        {/* Raw Material Overview */}
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
                  <img
                    src={rawMaterial.images[selectedImage]?.url || rawMaterial.mainImage || "/placeholder.svg"}
                    alt={rawMaterial.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                  />

                  {isZoomed && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <img
                        src={rawMaterial.images[selectedImage]?.url || rawMaterial.mainImage || "/placeholder.svg"}
                        alt={rawMaterial.name}
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
                {rawMaterial.images && rawMaterial.images.length > 1 && (
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
                {rawMaterial.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
                    {rawMaterial.discount}% OFF
                  </div>
                )}

                {/* Favorite button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <Heart
                    size={20}
                    className={isFavorite ? "text-red-500" : "text-gray-400"}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Thumbnail images */}
              {rawMaterial.images && rawMaterial.images.length > 1 && (
                <div className="flex overflow-x-auto p-4 space-x-3 bg-white">
                  {rawMaterial.images.map((image, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 flex-shrink-0 border-2 rounded-md cursor-pointer overflow-hidden ${
                        index === selectedImage
                          ? "border-teal-500 shadow-md"
                          : "border-transparent hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`${rawMaterial.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Material Details */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="mb-2 flex items-center">
                <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  {rawMaterial.category}
                </span>
                {rawMaterial.subcategory && (
                  <span className="ml-2 text-sm text-gray-500">
                    <span className="font-medium">{rawMaterial.subcategory}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{rawMaterial.name}</h1>

              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.round(rawMaterial.ratings || 0) ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">{rawMaterial.ratings?.toFixed(1) || "0.0"}</span>
                <span className="mx-2 text-gray-300">|</span>
                <button onClick={() => setActiveTab("reviews")} className="text-sm text-teal-600 hover:underline">
                  {rawMaterial.numReviews || 0} {rawMaterial.numReviews === 1 ? "review" : "reviews"}
                </button>
              </div>

              <div className="flex items-end mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{rawMaterial.price.toLocaleString()}</span>
                {rawMaterial.originalPrice && rawMaterial.originalPrice > rawMaterial.price && (
                  <div className="ml-3 flex flex-col">
                    <span className="text-sm text-gray-500 line-through">
                      ₹{rawMaterial.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      Save ₹{(rawMaterial.originalPrice - rawMaterial.price).toLocaleString()} (
                      {Math.round(((rawMaterial.originalPrice - rawMaterial.price) / rawMaterial.originalPrice) * 100)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Short description */}
              <div className="mb-6">
                <p className="text-gray-600">{rawMaterial.description.split(".")[0]}.</p>
              </div>

              {/* Availability */}
              <div className="mb-6 flex items-center">
                {rawMaterial.quantity > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-medium">In Stock</span>
                    <span className="text-gray-500 ml-2">({rawMaterial.quantity} available)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Supplier Info */}
              {rawMaterial.createdBy && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Building size={16} className="mr-2" />
                    Supplier Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900">{rawMaterial.createdBy.supplierName}</p>
                    {rawMaterial.createdBy.businessType && (
                      <p className="text-sm text-gray-600">{rawMaterial.createdBy.businessType}</p>
                    )}
                    {rawMaterial.createdBy.email && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail size={14} className="mr-1" />
                        {rawMaterial.createdBy.email}
                      </p>
                    )}
                    {rawMaterial.createdBy.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone size={14} className="mr-1" />
                        {rawMaterial.createdBy.phone}
                      </p>
                    )}
                    {rawMaterial.createdBy.establishedYear && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Established: {rawMaterial.createdBy.establishedYear}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              {rawMaterial.quantity > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={rawMaterial.quantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(rawMaterial.quantity, Math.max(1, Number.parseInt(e.target.value) || 1)),
                        )
                      }
                      className="w-16 h-10 px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setQuantity((prev) => Math.min(rawMaterial.quantity, prev + 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= rawMaterial.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={rawMaterial.quantity < 1}
                  className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
                    rawMaterial.quantity > 0
                      ? "bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={rawMaterial.quantity < 1}
                  className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
                    rawMaterial.quantity > 0
                      ? "bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <CreditCard size={18} className="mr-2" />
                  Buy Now
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Share size={18} />
                </button>
              </div>

              {/* Material highlights */}
              <div className="border-t border-gray-200 pt-6 mt-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Material Highlights</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check size={16} className="text-teal-500 mr-2 flex-shrink-0" />
                    <span>Quality assured</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <RefreshCw size={16} className="text-teal-500 mr-2 flex-shrink-0" />
                    <span>30-day returns</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield size={16} className="text-teal-500 mr-2 flex-shrink-0" />
                    <span>Verified supplier</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck size={16} className="text-teal-500 mr-2 flex-shrink-0" />
                    <span>Fast delivery</span>
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
                Reviews ({rawMaterial.numReviews || 0})
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
              {rawMaterial.features && rawMaterial.features.length > 0 && (
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
                onClick={() => setActiveTab("supplier")}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "supplier"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Supplier Details
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
                          {rawMaterial.ratings ? rawMaterial.ratings.toFixed(1) : "0.0"}
                        </div>
                        <div className="flex justify-center text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              fill={i < Math.floor(rawMaterial.ratings || 0) ? "currentColor" : "none"}
                              stroke="currentColor"
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          Based on {rawMaterial.numReviews || 0} reviews
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div className="md:w-2/3 md:pl-8">
                      <h4 className="font-medium text-gray-900 mb-4">Rating Distribution</h4>
                      {rawMaterial.numReviews > 0 ? (
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const ratingCount = reviews.filter(review => review.rating === rating).length;
                            const percentage = rawMaterial.numReviews > 0 ? (ratingCount / rawMaterial.numReviews) * 100 : 0;
                            
                            return (
                              <div key={rating} className="flex items-center">
                                <div className="flex items-center w-16">
                                  <span className="text-sm text-gray-600 mr-1">{rating}</span>
                                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                                </div>
                                <div className="flex-1 mx-3">
                                  <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${percentage}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 w-20">
                                  <span className="text-sm text-gray-600">{ratingCount}</span>
                                  <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No rating data available</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                {!hasUserReviewed && currentUser ? (
                  <div className="mb-8 border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                              className="p-1 focus:outline-none"
                            >
                              <Star
                                size={24}
                                className="text-yellow-400"
                                fill={star <= reviewForm.rating ? "currentColor" : "none"}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-gray-600">({reviewForm.rating}/5)</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Brief title for your review"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                        <textarea
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Share your experience with this raw material... (minimum 10 characters)"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                          required
                        ></textarea>
                        <div className="text-xs text-gray-500 mt-1">
                          {reviewForm.comment.length}/1000 characters
                        </div>
                      </div>

                      {reviewSubmitError && (
                        <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md">{reviewSubmitError}</div>
                      )}

                      {reviewSubmitSuccess && (
                        <div className="p-3 mb-4 bg-green-50 text-green-700 text-sm rounded-md">
                          {reviewSubmitSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-70 transition-colors"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                ) : hasUserReviewed ? (
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <div className="bg-teal-50 p-4 rounded-md flex items-center">
                      <Check size={18} className="text-teal-600 mr-2" />
                      <p className="text-teal-700">
                        You have already reviewed this raw material. Thank you for your feedback!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-md flex items-center">
                      <User size={18} className="text-gray-600 mr-2" />
                      <p className="text-gray-700">
                        Please <button onClick={() => router.push('/login')} className="text-teal-600 hover:underline">login</button> to write a review.
                      </p>
                    </div>
                  </div>
                )}

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
                      <p className="text-gray-500 mb-4">Be the first to review this raw material!</p>
                      {currentUser && !hasUserReviewed && (
                        <button
                          onClick={() => setActiveTab("reviews")}
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                          {editingReview === review._id ? (
                            // Edit form
                            <form onSubmit={handleUpdateReview} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditForm((prev) => ({ ...prev, rating: star }))}
                                      className="p-1 focus:outline-none"
                                    >
                                      <Star
                                        size={24}
                                        className="text-yellow-400"
                                        fill={star <= editForm.rating ? "currentColor" : "none"}
                                      />
                                    </button>
                                  ))}
                                  <span className="ml-2 text-gray-600">({editForm.rating}/5)</span>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="Brief title for your review"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                <textarea
                                  rows="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="Share your experience with this raw material... (minimum 10 characters)"
                                  value={editForm.comment}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                                  required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {editForm.comment.length}/1000 characters
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                >
                                  Update Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingReview(null)}
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            // Display review
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-3">
                                    {review.userProfilePicture ? (
                                      <img 
                                        src={review.userProfilePicture} 
                                        alt={review.userName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className="w-full h-full flex items-center justify-center" style={{display: review.userProfilePicture ? 'none' : 'flex'}}>
                                      <User size={20} className="text-gray-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <p className="font-medium text-gray-900">{review.userName}</p>
                                      {review.supplierName && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          Supplier: {review.supplierName}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                  </div>
                                </div>
                                
                                {/* Edit/Delete buttons for user's own review */}
                                {currentUser && review.userId.toString() === currentUser.id.toString() && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(review._id)}
                                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      Delete
                                    </button>
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
                            </>
                          )}
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
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{rawMaterial.description}</p>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" && rawMaterial.features && (
              <div>
                <ul className="space-y-3">
                  {rawMaterial.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="text-teal-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supplier Details Tab */}
            {activeTab === "supplier" && rawMaterial.createdBy && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Building size={24} className="text-teal-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">{rawMaterial.createdBy.supplierName}</h3>
                  </div>
                  
                  {rawMaterial.createdBy.description && (
                    <p className="text-gray-700 mb-4">{rawMaterial.createdBy.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rawMaterial.createdBy.businessType && (
                      <div className="flex items-center">
                        <Tag size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Business Type:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{rawMaterial.createdBy.businessType}</span>
                      </div>
                    )}
                    
                    {rawMaterial.createdBy.establishedYear && (
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Established:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{rawMaterial.createdBy.establishedYear}</span>
                      </div>
                    )}
                    
                    {rawMaterial.createdBy.email && (
                      <div className="flex items-center">
                        <Mail size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <a href={`mailto:${rawMaterial.createdBy.email}`} className="ml-2 text-sm font-medium text-teal-600 hover:underline">
                          {rawMaterial.createdBy.email}
                        </a>
                      </div>
                    )}
                    
                    {rawMaterial.createdBy.phone && (
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <a href={`tel:${rawMaterial.createdBy.phone}`} className="ml-2 text-sm font-medium text-teal-600 hover:underline">
                          {rawMaterial.createdBy.phone}
                        </a>
                      </div>
                    )}
                    
                    {rawMaterial.createdBy.websiteUrl && (
                      <div className="flex items-center">
                        <Globe size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Website:</span>
                        <a 
                          href={rawMaterial.createdBy.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-2 text-sm font-medium text-teal-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {rawMaterial.createdBy.businessAddress && (
                      <div className="flex items-start col-span-2">
                        <MapPin size={16} className="text-gray-500 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600">Address:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{rawMaterial.createdBy.businessAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contact Supplier Button */}
                <div className="flex space-x-4">
                  {rawMaterial.createdBy.email && (
                    <a
                      href={`mailto:${rawMaterial.createdBy.email}?subject=Inquiry about ${rawMaterial.name}`}
                      className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-md hover:bg-teal-700 transition-colors text-center font-medium"
                    >
                      Contact Supplier
                    </a>
                  )}
                  
                  {rawMaterial.createdBy.phone && (
                    <a
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors text-center font-medium"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
}