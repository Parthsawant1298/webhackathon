"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const StatsComponent = () => {
  // State for counting animation
  const [counts, setCounts] = useState({
    vendors: 0,
    suppliers: 0,
    successRate: 0,
    savings: 0,
  })

  // Animate the counter on component mount
  useEffect(() => {
    const duration = 2000 // animation duration in ms
    const steps = 60 // number of steps for the animation
    const interval = duration / steps

    const targetValues = {
      vendors: 10000,
      suppliers: 5000,
      successRate: 98,
      savings: 25,
    }

    let step = 0

    const timer = setInterval(() => {
      step += 1
      const progress = Math.min(step / steps, 1)

      setCounts({
        vendors: Math.floor(progress * targetValues.vendors),
        suppliers: Math.floor(progress * targetValues.suppliers),
        successRate: Math.floor(progress * targetValues.successRate),
        savings: Math.floor(progress * targetValues.savings),
      })

      if (step >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  // Stats data
  const stats = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          style={{color: '#347433'}}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      value: counts.vendors.toLocaleString(),
      label: "Street Vendors",
      suffix: "+",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          style={{color: '#347433'}}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
      value: counts.suppliers.toLocaleString(),
      label: "Verified Suppliers",
      suffix: "+",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          style={{color: '#347433'}}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      value: counts.successRate,
      label: "Anonymous Success Rate",
      suffix: "%",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          style={{color: '#347433'}}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      value: counts.savings,
      label: "Average Cost Savings",
      suffix: "%",
    },
  ]

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  // Card animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.6,
      },
    },
    hover: {
      y: -10,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  }

  return (
    <div className="w-full py-16" style={{background: 'linear-gradient(to bottom, #ffffff 0%, #f0f9f0 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl font-bold text-center mb-12 text-gray-800"
        >
          Trusted by <span style={{color: '#347433'}}>Street Vendors Across India</span>
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-lg overflow-hidden group"
            >
              <div className="p-6 flex flex-col items-center text-center relative">
                <div className="absolute -top-10 left-0 w-full h-32 rounded-full transform -translate-x-1/2 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" style={{background: 'radial-gradient(circle, rgba(52, 116, 51, 0.1) 0%, rgba(125, 216, 126, 0.05) 100%)'}}></div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="mb-4 p-3 rounded-full"
                  style={{backgroundColor: '#f0f9f0'}}
                >
                  {stat.icon}
                </motion.div>

                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.7 }}
                >
                  <span className="text-4xl font-bold text-gray-800">{stat.value}</span>
                  <span className="text-2xl font-medium" style={{color: '#347433'}}>{stat.suffix}</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.7 }}
                  className="text-gray-600 font-medium mt-2"
                >
                  {stat.label}
                </motion.p>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
                  className="h-1 rounded-full mt-4"
                  style={{background: 'linear-gradient(to right, #7dd87e, #347433)'}}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default StatsComponent