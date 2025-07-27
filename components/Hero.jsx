"use client"

import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SupplyMindHeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  const slides = [
    {
      badge: "🚀 AI-Powered Supply Chain Revolution",
      title: "Transform Your",
      subtitle: "Raw Material Sourcing",
      description:
        "Connect street food vendors with verified suppliers through our anonymous AI marketplace. Get real-time inventory analysis, smart recommendations, and guaranteed surplus buyback.",
      image: "/hero-slide-1.jpg",
      stats: { value: "₹8,000Cr", label: "Daily Market Size" },
    },
    {
      badge: "🔒 Anonymous B2B Marketplace",
      title: "Complete Privacy",
      subtitle: "Guaranteed Protection",
      description:
        "Shop with complete anonymity while accessing verified supplier details. Our one-way protection system ensures vendor safety with transparent supplier information.",
      image: "/hero-slide-2.jpg",
      stats: { value: "100%", label: "Privacy Protected" },
    },
    {
      badge: "♻️ Zero Waste Guarantee",
      title: "Surplus Buyback",
      subtitle: "Program",
      description:
        "Never worry about excess inventory again. Our platform guarantees to purchase your surplus materials at fair prices, creating a circular economy for all participants.",
      image: "/hero-slide-4.jpeg",
      stats: { value: "Zero", label: "Waste Guaranteed" },
    },
  ]

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 6000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, slides.length])

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 12000)
  }

  const nextSlide = () => {
    pauseAutoPlay()
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    pauseAutoPlay()
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    pauseAutoPlay()
    setCurrentSlide(index)
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <img
              src={slide.image || "/placeholder.jpg"}
              alt="SupplyMind Platform"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center px-4 py-2 backdrop-blur-md border rounded-full animate-pulse" style={{backgroundColor: 'rgba(52, 116, 51, 0.2)', borderColor: 'rgba(52, 116, 51, 0.3)'}}>
                <span className="text-xs sm:text-sm font-medium" style={{color: '#7dd87e'}}>{slides[currentSlide].badge}</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  <span className="block opacity-90">{slides[currentSlide].title}</span>
                  <span className="block text-white">
                    {slides[currentSlide].subtitle}
                  </span>
                </h1>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed max-w-2xl">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/rawmaterials" className="group px-4 py-2 sm:px-6 sm:py-3 text-white rounded-xl font-semibold text-sm sm:text-base shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2" style={{background: 'linear-gradient(to right, #347433, #2d5f2d)', boxShadow: '0 10px 25px rgba(52, 116, 51, 0.3)'}}>
                  <span>Get Started</span>
                  <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
                </a>

                <a href="/about" className="group px-4 py-2 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center space-x-2" style={{'--hover-border-color': 'rgba(52, 116, 51, 0.5)'}} onMouseEnter={(e) => e.target.style.borderColor = 'rgba(52, 116, 51, 0.5)'} onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}>
                  <Play className="h-5 w-5" />
                  <span>Learn More</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl sm:text-3xl font-bold mb-2" style={{color: '#7dd87e'}}>
                  {slides[currentSlide].stats.value}
                </div>
                <div className="text-gray-300 text-sm sm:text-base">{slides[currentSlide].stats.label}</div>
                <div className="mt-4 h-1 rounded-full" style={{background: 'linear-gradient(to right, #7dd87e, #5cb85c)'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 shadow-lg"
                : "bg-white/40 w-3 hover:bg-white/60"
            }`}
            style={currentSlide === index ? {backgroundColor: '#7dd87e', boxShadow: '0 4px 14px 0 rgba(125, 216, 126, 0.5)'} : {}}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-20">
        <div
          className="h-full transition-all duration-300 ease-linear shadow-lg"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            background: 'linear-gradient(to right, #7dd87e, #5cb85c)',
            boxShadow: '0 4px 14px 0 rgba(125, 216, 126, 0.5)'
          }}
        />
      </div>

      <div className="absolute top-20 right-8 z-10 hidden lg:block">
        <div className="w-20 h-20 rounded-full animate-pulse" style={{backgroundColor: 'rgba(52, 116, 51, 0.2)'}}></div>
      </div>
      <div className="absolute bottom-32 left-8 z-10 hidden lg:block">
        <div className="w-12 h-12 rounded-full animate-bounce" style={{backgroundColor: 'rgba(125, 216, 126, 0.2)'}}></div>
      </div>
    </div>
  )
}

export default SupplyMindHeroBanner