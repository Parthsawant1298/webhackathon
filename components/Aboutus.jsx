'use client'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Testimonial from '@/components/Testimonial'
import { Clock, Coffee, HeartHandshake, Package, Shield, ShoppingBag, Truck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AboutusPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { number: "2024", label: "Founded", icon: <ShoppingBag className="h-6 w-6" /> },
    { number: "10M+", label: "Street Vendors Served", icon: <Users className="h-6 w-6" /> },
    { number: "48", label: "Hour AI Prediction", icon: <Clock className="h-6 w-6" /> },
    { number: "₹8000Cr", label: "Daily Market Size", icon: <Package className="h-6 w-6" /> }
  ]

  const values = [
    {
      icon: <Truck className="h-12 w-12" />,
      title: "AI Vision Scanner",
      description: "Our proprietary computer vision system analyzes inventory levels by scanning vendor stalls, predicting demand patterns based on location, weather, and historical data."
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: "Anonymous Protection",
      description: "One-way anonymity system protects street vendors from exploitation while maintaining complete supplier transparency with verified credentials and quality ratings."
    },
    {
      icon: <HeartHandshake className="h-12 w-12" />,
      title: "Surplus Buyback",
      description: "Zero-waste program guarantees to purchase excess raw materials at 60-70% of original price, eliminating financial risk and promoting environmental sustainability."
    }
  ]

  const categories = [
    {
      id: 'mop-tools',
      title: 'MOP & TOOLS',
      label: 'EXPLORE',
      image: 'https://images.unsplash.com/photo-1558618047-e99f1b8e4b20?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      route: '/category/mop-tools'
    },
    {
      id: 'disposables',
      title: 'DISPOSABLES',
      label: 'EXPLORE',
      image: 'https://images.unsplash.com/photo-1607721958099-de640de69d9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      route: '/category/disposables'
    },
    {
      id: 'stationery',
      title: 'STATIONERY',
      label: 'EXPLORE',
      image: 'https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      route: '/category/stationery'
    },
    {
      id: 'tissue',
      title: 'TISSUE',
      label: 'FEATURED',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      route: '/category/tissue'
    },
    {
      id: 'cleaning-chemicals',
      title: 'CLEANING CHEMICALS',
      label: 'FEATURED',
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      route: '/category/cleaning-chemicals'
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[35rem] overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full" style={{ backgroundColor: '#347433' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full" style={{ backgroundColor: '#FF6F3C' }}></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-24 rounded-full" style={{ backgroundColor: '#B22222' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-20 h-full">
          <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center mb-2 md:mb-4">
              ABOUT
              <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 50%, #1e4a1e 100%)', WebkitBackgroundClip: 'text' }}> SupplyMind</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 text-center max-w-3xl">
              Revolutionizing India's Street Food Supply Chain Through AI and Anonymous Commerce
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden h-96">
                <img 
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                  alt="SupplyMind Street Food Technology"
                  className="w-full h-full object-cover rounded-lg transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-6">
              <span className="font-semibold tracking-wider uppercase" style={{color: '#347433'}}>Who We Are</span>
              <h2 className="text-4xl font-bold text-gray-900">
                AI-Powered Street Food Supply Chain Revolution
              </h2>
              <p className="text-gray-600 text-lg">
                SupplyMind is India's first AI-powered anonymous marketplace specifically designed for street food vendors and raw material suppliers. We're solving the daily struggle faced by 10 million street vendors across India who waste hours every day sourcing quality raw materials at fair prices.
              </p>
              <p className="text-gray-600 text-lg">
                Our revolutionary platform combines cutting-edge computer vision technology with a unique one-way anonymity system that protects vulnerable vendors while ensuring complete transparency about supplier quality and credentials. We're transforming a ₹8,000 crore daily market.
              </p>
              <div className="flex gap-4 pt-4">
                <Coffee style={{color: '#347433'}} className="h-6 w-6" />
                <div>
                  <h3 className="text-gray-900 font-semibold">Our Mission</h3>
                  <p className="text-gray-600">To democratize business opportunities for street food vendors through technology-enabled market access, creating India's most inclusive B2B marketplace where success is determined by quality and service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20" style={{ backgroundColor: '#f0f9f0' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="mb-4" style={{color: '#347433'}}>{stat.icon}</div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Our Technology Features
            </h2>
            <p className="text-xl text-gray-600 mx-auto max-w-2xl">
              Revolutionary AI-powered solutions transforming street food supply chain management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div id="ai-vision" className="bg-white rounded-xl p-8 shadow-lg">
              <Package style={{color: '#347433'}} className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI VISION SCANNER</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Smart inventory analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Demand pattern prediction
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Real-time stall scanning
                </li>
              </ul>
            </div>
            
            <div id="anonymous" className="bg-white rounded-xl p-8 shadow-lg">
              <Package style={{color: '#347433'}} className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ANONYMOUS MARKETPLACE</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  One-way vendor protection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Supplier transparency
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Encrypted negotiations
                </li>
              </ul>
            </div>
            
            <div id="recommendations" className="bg-white rounded-xl p-8 shadow-lg">
              <Package style={{color: '#347433'}} className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SMART RECOMMENDATIONS</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Weather-based predictions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Local event analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Optimal quantity suggestions
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div id="surplus" className="bg-white rounded-xl p-8 shadow-lg">
              <Package style={{color: '#347433'}} className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SURPLUS BUYBACK</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Zero-waste guarantee
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  60-70% buyback rates
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Circular economy model
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Package style={{color: '#347433'}} className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BULK ORDERING</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Volume discounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Group purchasing power
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#347433'}}></span>
                  Wholesale pricing access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f9f0 100%)' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600 mx-auto max-w-2xl">
              Revolutionary technology solutions empowering India's street food ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <div className="mb-6" style={{color: '#347433'}}>{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="font-semibold tracking-wider uppercase px-4 py-2 rounded-full" style={{color: '#347433', backgroundColor: '#f0f9f0'}}>Social Impact</span>
            <h2 className="text-5xl font-bold mt-6 mb-6 text-gray-900">
              Our <span style={{color: '#347433'}}>Revolutionary</span> Impact
            </h2>
            <p className="text-xl text-gray-600 mx-auto max-w-2xl">
              Empowering 10 million street food vendors across India through technology and creating an inclusive B2B marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 p-8 rounded-xl shadow-lg h-full" style={{ background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)' }}>
              <h3 className="text-2xl font-bold text-gray-900">Transforming Street Food Ecosystem</h3>
              <p className="text-gray-600 text-lg mb-8">
                SupplyMind is revolutionizing how street food vendors access raw materials, creating unprecedented efficiency and fairness:
              </p>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-3 rounded-full" style={{backgroundColor: '#f0f9f0'}}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#347433'}}>1</span>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{color: '#347433'}}>10 Million Vendors Empowered</h4>
                    <p className="text-gray-600">Direct access to transparent pricing and quality suppliers across India's street food network</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-3 rounded-full" style={{backgroundColor: '#f0f9f0'}}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#347433'}}>2</span>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{color: '#347433'}}>15-20% Cost Reduction</h4>
                    <p className="text-gray-600">AI-powered optimization reduces procurement costs through direct supplier connections and bulk ordering</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-3 rounded-full" style={{backgroundColor: '#f0f9f0'}}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#347433'}}>3</span>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{color: '#347433'}}>40% Waste Reduction</h4>
                    <p className="text-gray-600">Surplus buyback program creates circular economy while providing additional vendor income</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-3 rounded-full" style={{backgroundColor: '#f0f9f0'}}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#347433'}}>4</span>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{color: '#347433'}}>Anonymous Protection System</h4>
                    <p className="text-gray-600">Revolutionary one-way anonymity protects vulnerable vendors from discrimination and exploitation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-3 rounded-full" style={{backgroundColor: '#f0f9f0'}}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#347433'}}>5</span>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{color: '#347433'}}>₹8,000 Crore Market Impact</h4>
                    <p className="text-gray-600">Digitizing India's massive informal food sector while preserving cultural authenticity</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-full">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full z-0" style={{backgroundColor: '#f0f9f0'}}></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full z-0" style={{backgroundColor: '#f0f9f0'}}></div>
              <div className="relative h-full rounded-xl overflow-hidden z-10 shadow-xl" style={{ minHeight: '550px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="SupplyMind Technology Impact"
                  className="w-full h-full object-cover rounded-lg transform hover:scale-105 transition-transform duration-700"
                  style={{ height: '100%', objectPosition: 'center' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(52, 116, 51, 0.3) 0%, transparent 100%)' }}></div>
                <div className="absolute bottom-4 left-4 right-4 text-center bg-white/90 p-4 rounded-lg shadow-lg">
                  <p className="font-semibold" style={{color: '#347433'}}>Revolutionizing street food supply chains through AI innovation since 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
     
      <Testimonial />
      <Footer />
    </main>
  )
}