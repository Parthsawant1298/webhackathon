"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ChevronDown, ChevronUp, Mail, MessageSquare, Phone, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HelpAndSupport() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'platform', name: 'Platform Features' },
    { id: 'vendors', name: 'For Vendors' },
    { id: 'suppliers', name: 'For Suppliers' },
    { id: 'technology', name: 'AI Technology' }
  ];

  const faqs = [
    {
      category: 'platform',
      question: "What is SupplyMind and how does it work?",
      answer: "SupplyMind is India's first AI-powered anonymous marketplace specifically designed for street food vendors and raw material suppliers. Our platform uses computer vision technology to analyze vendor stall inventory, predict demand patterns, and connect vendors with quality suppliers through a one-way anonymity system that protects vendors while ensuring supplier transparency."
    },
    {
      category: 'vendors',
      question: "How does the anonymous protection system work for vendors?",
      answer: "Our revolutionary one-way anonymity system protects vulnerable street food vendors from discrimination and exploitation. Vendors can browse, negotiate, and purchase from suppliers without revealing their identity, location, or business details. However, all supplier information including credentials, quality ratings, and business verification are completely transparent to vendors."
    },
    {
      category: 'technology',
      question: "How does the AI Vision Scanner work?",
      answer: "Our proprietary computer vision system uses smartphone cameras to scan your street food stall and automatically analyze inventory levels of raw materials. The AI then predicts your demand patterns based on location data, weather forecasts, local events, and historical sales data to recommend optimal purchasing quantities and timing."
    },
    {
      category: 'suppliers',
      question: "What is the Surplus Buyback program?",
      answer: "Our zero-waste guarantee program ensures that any excess raw materials purchased through SupplyMind will be bought back at 60-70% of the original price. This eliminates financial risk for vendors, promotes environmental sustainability, and creates a circular economy model that benefits everyone in the supply chain."
    },
    {
      category: 'platform',
      question: "What types of raw materials can I find on SupplyMind?",
      answer: "SupplyMind connects street food vendors with suppliers of all essential raw materials including fresh vegetables, spices, cooking oils, packaging materials, disposable plates and cups, cleaning supplies, and specialty ingredients. Our AI system categorizes suppliers by cuisine type, quality ratings, delivery speed, and price competitiveness."
    },
    {
      category: 'vendors',
      question: "How much can I save using SupplyMind?",
      answer: "Street food vendors typically save 15-20% on their raw material costs through SupplyMind. Our AI-powered bulk ordering recommendations, direct supplier connections, and elimination of middlemen markup result in significant cost reductions. Additionally, the surplus buyback program provides an extra income stream for vendors."
    },
    {
      category: 'technology',
      question: "How accurate are the AI demand predictions?",
      answer: "Our AI system achieves 85-90% accuracy in demand prediction by analyzing multiple data points including weather patterns, local events, festival calendars, foot traffic data, and historical sales patterns. The system continuously learns from your specific stall performance to provide increasingly personalized recommendations."
    },
    {
      category: 'suppliers',
      question: "How do I become a verified supplier on SupplyMind?",
      answer: "Suppliers must complete our comprehensive verification process including business license validation, quality certifications, food safety compliance, and financial background checks. We prioritize suppliers who can guarantee consistent quality, timely delivery, and fair pricing. Once verified, suppliers gain access to our network of 10+ million street food vendors across India."
    },
    {
      category: 'platform',
      question: "Is there a minimum order requirement?",
      answer: "No minimum order requirements! SupplyMind is designed specifically for street food vendors of all sizes. Our AI system helps optimize order quantities based on your stall size, customer traffic, and storage capacity. For larger orders, we offer additional bulk discounts and coordinated delivery schedules."
    },
    {
      category: 'vendors',
      question: "How does delivery work and what are the costs?",
      answer: "SupplyMind partners with local logistics providers to ensure next-day delivery in major cities and 2-3 day delivery in smaller towns. Delivery costs are optimized through our AI route planning system. For orders above ₹500, delivery is free. We also offer consolidated delivery services where multiple vendors in the same area can share delivery costs."
    },
    {
      category: 'technology',
      question: "Do I need special equipment to use SupplyMind?",
      answer: "You only need a smartphone! Our mobile app works on any Android or iOS device. The AI Vision Scanner uses your phone's camera - no additional hardware required. The app works offline for basic functions and syncs when you have internet connectivity, making it perfect for street vendors with limited connectivity."
    },
    {
      category: 'platform',
      question: "How does pricing work on the platform?",
      answer: "SupplyMind uses dynamic pricing based on real-time market conditions, seasonal variations, and bulk ordering opportunities. Our AI system continuously monitors market prices to ensure vendors get the best deals. Prices are transparent with no hidden fees - you see the exact supplier price, delivery cost, and any applicable discounts before ordering."
    },
    {
      category: 'suppliers',
      question: "What are the benefits for suppliers joining SupplyMind?",
      answer: "Suppliers gain access to a verified network of 10+ million street food vendors, reduced customer acquisition costs, automated order processing, guaranteed payments, and data insights about market demand. Our platform handles customer service, dispute resolution, and provides marketing tools to help suppliers grow their business."
    },
    {
      category: 'vendors',
      question: "How does SupplyMind help during festival seasons or special events?",
      answer: "Our AI system automatically detects upcoming festivals, local events, and seasonal demand spikes in your area. It sends advance notifications with recommended inventory increases, suggests specialty items for specific festivals, and helps coordinate with suppliers for guaranteed availability during high-demand periods."
    },
    {
      category: 'platform',
      question: "What support is available if I have issues with orders?",
      answer: "SupplyMind offers 24/7 customer support through our mobile app chat, phone support in 12 regional languages, and dedicated relationship managers for high-volume vendors. Our AI-powered support system can resolve most common issues instantly, and we guarantee response times of under 30 minutes for urgent problems."
    }
  ];

  useEffect(() => {
    const filtered = faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredFaqs(filtered);
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center mb-2 md:mb-4">
              HELP AND 
              <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 50%, #1e4a1e 100%)', WebkitBackgroundClip: 'text' }}> SUPPORT</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 text-center max-w-3xl">
              Everything you need to know about SupplyMind's AI-powered street food supply chain platform
            </p>
          </div>
        </div>
      </section>

    

      {/* Search Section */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions about SupplyMind..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                style={{ focusBorderColor: '#347433' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                style={selectedCategory === category.id ? { backgroundColor: '#347433' } : {}}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked
              <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 100%)', WebkitBackgroundClip: 'text' }}> Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about SupplyMind and how we revolutionize street food supply chains
            </p>
          </div>

          <div className="grid gap-8 max-w-3xl mx-auto">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm"
                style={{ '&:hover': { borderColor: 'rgba(52, 116, 51, 0.3)' } }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="h-6 w-6" style={{color: '#347433'}} />
                  ) : (
                    <ChevronDown className="h-6 w-6" style={{color: '#347433'}} />
                  )}
                </button>
                <div
                  className={`px-6 transition-all duration-300 ${
                    openIndex === index ? 'pb-6 opacity-100' : 'h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Need More
              <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 100%)', WebkitBackgroundClip: 'text' }}> Information?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our team is here to help transform your street food business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center transition-all shadow-sm" style={{ '&:hover': { borderColor: 'rgba(52, 116, 51, 0.3)' } }}>
              <Mail className="w-12 h-12 mx-auto mb-4" style={{color: '#347433'}} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">support@supplymind.ai</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center transition-all shadow-sm" style={{ '&:hover': { borderColor: 'rgba(52, 116, 51, 0.3)' } }}>
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{color: '#347433'}} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Support</h3>
              <p className="text-gray-600">Available 24/7 in 12 languages</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center transition-all shadow-sm" style={{ '&:hover': { borderColor: 'rgba(52, 116, 51, 0.3)' } }}>
              <Phone className="w-12 h-12 mx-auto mb-4" style={{color: '#347433'}} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">Talk to our AI specialists</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}