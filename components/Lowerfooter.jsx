"use client"
import { useEffect, useState, useRef } from "react"

const SupplyMindBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  // SupplyMind Banner data
  const banners = [
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "AI-POWERED INVENTORY SCANNING FOR STREET VENDORS",
      buttonText: "START FREE TRIAL",
      buttonLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "ANONYMOUS MARKETPLACE PROTECTING VENDOR IDENTITY",
      buttonText: "EXPLORE MARKETPLACE",
      buttonLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "SERVING 10,000+ STREET VENDORS ACROSS INDIA",
      buttonText: "JOIN NOW",
      buttonLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "SURPLUS BUYBACK GUARANTEE - ZERO WASTE PROMISE",
      buttonText: "LEARN MORE",
      buttonLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "CONNECT WITH VERIFIED SUPPLIERS IN YOUR AREA",
      buttonText: "FIND SUPPLIERS",
      buttonLink: "#"
    }
  ]

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, banners.length])

  // Navigation functions
  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentSlide(index)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + banners.length) % banners.length)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % banners.length)
  }

  return (
    <div className="mb-8 sm:mb-12"> {/* Added top and bottom margin */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-white shadow-lg"> {/* Added shadow */}
        {/* Slide images */}
        <div className="absolute inset-0 w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="object-cover w-full h-full"
              />
              {/* Overlay with gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Content - Centered instead of right-aligned */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-xl px-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg">
              {banners[currentSlide].title}
            </h3>
            <a 
              href={banners[currentSlide].buttonLink}
              className="inline-block px-8 py-3 text-white transition-all duration-300 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{background: 'linear-gradient(to right, #347433, #2d5f2d)'}}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to right, #2d5f2d, #1e4a1e)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to right, #347433, #2d5f2d)'}
            >
              {banners[currentSlide].buttonText}
            </a>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
          style={{'--hover-text-color': '#7dd87e'}}
          onMouseEnter={(e) => e.target.style.color = '#7dd87e'}
          onMouseLeave={(e) => e.target.style.color = '#ffffff'}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
          style={{'--hover-text-color': '#7dd87e'}}
          onMouseEnter={(e) => e.target.style.color = '#7dd87e'}
          onMouseLeave={(e) => e.target.style.color = '#ffffff'}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? "w-8 h-2" : "w-2 h-2 bg-white bg-opacity-70 hover:bg-opacity-90"
              }`}
              style={currentSlide === index ? {background: 'linear-gradient(to right, #7dd87e, #f97316)'} : {}}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SupplyMindBanner