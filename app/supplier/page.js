'use client';

import Footer from '@/components/Footer';
import SupplierHeader from '@/components/SupplierHeader';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Package, Star, TrendingUp, Users } from 'lucide-react';

export default function SupplierPage() {
  const features = [
    {
      icon: Package,
      title: "Product Management",
      description: "Easily manage your product catalog with our intuitive interface"
    },
    {
      icon: Users,
      title: "Connect with Vendors",
      description: "Build relationships with street food vendors across the city"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track your sales performance and market trends"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Maintain high standards with our quality tracking system"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Suppliers" },
    { number: "1000+", label: "Connected Vendors" },
    { number: "50+", label: "Cities Covered" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <>
      <SupplierHeader />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#347433] rounded-full mb-6">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Grow Your <span className="text-[#347433]">Supply Business</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Join SupplyMind's network of trusted suppliers and connect with street food vendors 
                  across the country. Scale your business with our AI-powered platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/supplier/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#347433] hover:bg-[#2a5d2a] transition-colors duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.a>
                  <motion.a
                    href="/supplier/login"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-3 border border-[#347433] text-base font-medium rounded-md text-[#347433] bg-white hover:bg-green-50 transition-colors duration-200"
                  >
                    Sign In
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#347433] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose SupplyMind?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage and grow your supply business in one platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="w-12 h-12 bg-[#347433] rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#347433]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Join Our Network?
                </h2>
                <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                  Start connecting with street food vendors today and grow your business with SupplyMind
                </p>
                <motion.a
                  href="/supplier/register"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#347433] bg-white hover:bg-green-50 transition-colors duration-200"
                >
                  Register as Supplier
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
