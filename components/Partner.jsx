export default function Partner() {
  return (
    <main>
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-white via-green-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">Verified</span> Suppliers
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mx-auto max-w-2xl lg:max-w-3xl leading-relaxed px-4">
              We connect street vendors with trusted suppliers across India, ensuring quality raw materials and fair pricing for your business
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Content Section */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100 min-h-[500px] sm:min-h-[600px] lg:h-[700px] flex flex-col hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 order-2 lg:order-1">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Our Trusted Supply Network</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
                  At SupplyMind, we carefully verify all suppliers to ensure street vendors get the best quality raw materials at competitive prices
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 flex-1 py-2">
                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-green-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-green-600 group-hover:to-green-700 shadow-lg flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-700 text-xs sm:text-sm mb-1 truncate">Fresh Vegetable Suppliers</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Premium fresh vegetables, fruits, and produce delivered daily to your location</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-green-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-green-600 group-hover:to-green-700 shadow-lg flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-700 text-xs sm:text-sm mb-1 truncate">Spices & Masala Distributors</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Authentic spices, masalas, and seasonings from certified vendors across India</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-green-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-green-600 group-hover:to-green-700 shadow-lg flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-700 text-xs sm:text-sm mb-1 truncate">Oil & Dairy Product Suppliers</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Quality cooking oils, milk, paneer, and dairy essentials for street food preparation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-green-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-green-600 group-hover:to-green-700 shadow-lg flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-700 text-xs sm:text-sm mb-1 truncate">Packaging & Disposables</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Eco-friendly packaging, disposable plates, cups, and food containers</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-green-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-green-600 group-hover:to-green-700 shadow-lg flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-700 text-xs sm:text-sm mb-1 truncate">Grains & Flour Mills</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Fresh wheat flour, rice, pulses, and grains directly from verified mills</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Image Layout */}
            <div className="relative flex items-center justify-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] order-1 lg:order-2">
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
                
                {/* Top Left Image - Fresh Vegetables - LARGEST */}
                <div className="absolute top-0 left-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-lg md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Fresh vegetables and produce"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Top Right Image - Spices and Masalas - SMALL */}
                <div className="absolute top-2 sm:top-4 md:top-8 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Colorful spices and masalas"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Left Image - Oil and Dairy - SMALL */}
                <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-2 sm:left-4 md:left-8 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Cooking oils and dairy products"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Right Image - Street Food Stall - LARGEST */}
                <div className="absolute bottom-0 right-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-lg md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Street food vendor stall"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Enhanced Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white rounded-full shadow-lg md:shadow-2xl border-4 md:border-8 flex items-center justify-center z-30 hover:scale-105 transition-transform duration-300" style={{borderColor: '#e8f5e8'}}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-300" style={{background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 50%, #1e4a1e 100%)'}}>
                    <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wider drop-shadow-lg">S</span>
                  </div>
                </div>

                {/* Decorative Elements - Hide on mobile */}
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-4 h-4 md:w-8 md:h-8 rounded-full opacity-60 animate-pulse hidden sm:block" style={{background: 'linear-gradient(to right, #fbbf24, #f97316)'}}></div>
                <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 w-3 h-3 md:w-6 md:h-6 rounded-full opacity-60 animate-pulse hidden sm:block" style={{background: 'linear-gradient(to right, #347433, #2d5f2d)'}}></div>
                <div className="absolute top-1/4 -left-3 md:-left-6 w-2 h-2 md:w-4 md:h-4 rounded-full opacity-40 animate-pulse hidden sm:block" style={{background: 'linear-gradient(to right, #7dd87e, #5cb85c)'}}></div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}