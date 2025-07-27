"use client"

import { useState } from "react"
import { Check, HelpCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("monthly")

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

  const plans = [
    {
      name: "Basic Vendor",
      description: "For small street vendors starting their digital journey",
      price: {
        monthly: 299,
        yearly: 2990,
      },
      features: [
        "AI inventory scanning (50 scans/month)",
        "Basic supplier marketplace access",
        "Anonymous ordering protection",
        "Email support",
        "Standard delivery tracking",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Smart Vendor",
      description: "For established vendors with regular supply needs",
      price: {
        monthly: 599,
        yearly: 5990,
      },
      features: [
        "Unlimited AI inventory scanning",
        "Premium supplier marketplace",
        "Advanced anonymous protection",
        "Surplus buyback guarantee",
        "Priority chat & phone support",
        "Bulk ordering discounts",
        "Demand prediction analytics",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise Chain",
      description: "For multi-location vendors and food chains",
      price: {
        monthly: 1499,
        yearly: 14990,
      },
      features: [
        "Multi-location management",
        "Advanced AI demand forecasting",
        "Dedicated account manager",
        "Custom procurement workflows",
        "24/7 priority support",
        "Advanced analytics dashboard",
        "White-label integration",
        "Custom supplier network",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="py-16" style={{background: 'linear-gradient(to bottom, #ffffff 0%, #f0f9f0 100%)'}}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Simple <span style={{color: '#347433'}}>Pricing Plans</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your street food business needs
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              style={billingCycle === "monthly" ? {color: '#347433'} : {}}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "yearly" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              style={billingCycle === "yearly" ? {color: '#347433'} : {}}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly <span className="text-xs font-bold" style={{color: '#347433'}}>Save 20%</span>
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`bg-white rounded-2xl overflow-hidden border ${
                plan.popular ? "border-yellow-300 shadow-xl" : "border-gray-200 shadow-lg"
              } transition-all duration-300 hover:shadow-xl relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{(billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly).toLocaleString()}
                  </span>
                  <span className="text-gray-600">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center mb-6 flex items-center justify-center ${
                    plan.popular
                      ? "text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } transition-all duration-300`}
                  style={plan.popular ? {background: 'linear-gradient(to right, #347433, #2d5f2d)'} : {}}
                  onMouseEnter={plan.popular ? (e) => e.target.style.background = 'linear-gradient(to right, #2d5f2d, #1e4a1e)' : undefined}
                  onMouseLeave={plan.popular ? (e) => e.target.style.background = 'linear-gradient(to right, #347433, #2d5f2d)' : undefined}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{color: '#347433'}} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>


          </div>
        </div>
  )
}