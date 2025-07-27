"use client"

import { Truck, Users, Shield, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function WhyChooseUs() {
  const router = useRouter()

  // Your 5 categories with street vendor/supply chain images
  const categories = [
    {
      name: "FRESH VEGETABLES",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Premium quality fresh vegetables from verified suppliers"
    },
    {
      name: "COOKING OIL",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Pure refined cooking oils for all food preparations"
    },
    {
      name: "SPICES & MASALA",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Authentic spice blends and seasonings"
    },
    {
      name: "GRAINS & PULSES",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Premium quality rice, wheat and pulses"
    },
    {
      name: "DAIRY & BEVERAGES",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Fresh dairy products and beverage ingredients"
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const handleCategoryClick = () => {
    router.push('/rawmaterials')
  }

  const handleContactClick = () => {
    router.push('/contact')
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose <span className="text-green-600">SupplyMind</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We provide anonymous B2B marketplace solutions with unmatched quality and verified suppliers
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Main Categories Grid - First 4 categories */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-8 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div className="grid grid-cols-2 gap-1">
              {categories.slice(0, 4).map((category, index) => (
                <div 
                  key={index}
                  className="h-64 relative overflow-hidden group cursor-pointer"
                  onClick={handleCategoryClick}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    style={{
                      imageRendering: 'auto'
                    }}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 group-hover:from-black/80 transition-all duration-300">
                    <span className="text-white font-bold text-lg">{category.name}</span>
                    <span className="text-gray-200 text-sm mt-1">{category.description}</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      View Products
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Same Day Delivery Across India</span>
              </div>
              <button 
                onClick={handleCategoryClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
              >
                Shop Now
              </button>
            </div>
          </motion.div>

          {/* Fifth Category - Large Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div 
              className="h-[32rem] overflow-hidden relative group cursor-pointer"
              onClick={handleCategoryClick}
            >
              <img
                src={categories[4].image}
                alt={categories[4].name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                style={{
                  imageRendering: 'auto'
                }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Fallback image
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 group-hover:from-black/80 transition-all duration-300">
                <span className="text-white text-2xl font-bold">{categories[4].name}</span>
                <p className="text-gray-200 text-sm mt-2 mb-4">{categories[4].description}</p>
                <button className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm w-max">
                  View Products
                </button>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </motion.div>

          {/* Trust & Service Cards */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-7 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div className="grid grid-cols-3 gap-1">
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Anonymous B2B Solutions"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Anonymous B2B Solutions</span>
                </div>
              </div>
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="AI-Powered Matching"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">AI-Powered Matching</span>
                </div>
              </div>
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Surplus Buyback"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Surplus Buyback</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white border-2 border-green-100 flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white text-xs">
                  10K+
                </div>
              </div>
              <span className="text-sm text-green-700 font-medium">Trusted by 10K+ Street Vendors</span>
            </div>
          </motion.div>

          {/* Special Offer Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-5 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100"
          >
            <div className="p-8 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-black">Anonymous Marketplace!</h3>
              <p className="text-gray-600 mb-6">
                Get complete privacy protection while accessing verified suppliers. Perfect for street vendors across India.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-sm text-black">100% Anonymous</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-sm text-black">AI-Powered Matching</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-sm text-black">Surplus Buyback</span>
                </div>
              </div>
              <button 
                onClick={handleContactClick}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium w-max"
              >
                Contact
              </button>
            </div>
          </motion.div>
        </motion.div>

       
      </div>
    </div>
  )
}