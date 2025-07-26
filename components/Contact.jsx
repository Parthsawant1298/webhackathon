"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Clock, Mail, MapPin, Package, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Error submitting form:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[20rem] sm:h-[25rem] md:h-[35rem] overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full" style={{ backgroundColor: '#347433' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full" style={{ backgroundColor: '#FF6F3C' }}></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-20 h-full">
          <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center mb-2 md:mb-4">
              CONTACT
              <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 50%, #1e4a1e 100%)', WebkitBackgroundClip: 'text' }}> US</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 text-center max-w-3xl">
              Get in touch with SupplyMind to revolutionize your street food supply chain
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <main className="flex-grow" style={{ background: 'linear-gradient(180deg, #f0f9f0 0%, #ffffff 50%, #f9f9f9 100%)' }}>
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Contact Information */}
            <div className="space-y-8 md:space-y-12">
              <div>
                <h3 className="mb-2 md:mb-3 text-base md:text-lg" style={{color: '#347433'}}>AI-Powered Street Food Supply Chain</h3>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  Connect with 
                  <span className="text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 100%)', WebkitBackgroundClip: 'text' }}> SupplyMind</span>
                </h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Founded in 2024, SupplyMind is revolutionizing India's street food supply chain through AI-powered technology. We serve 10+ million street vendors across India with our anonymous marketplace, AI vision scanner, and surplus buyback program, transforming a ₹8,000 crore daily market through innovation and inclusion.
                </p>
              </div>

              <div className="space-y-6 md:space-y-10">
                {[
                  { 
                    title: 'AI Vision Scanner',
                    content: 'Our computer vision technology analyzes your stall inventory and predicts demand patterns with 85-90% accuracy using weather, events, and historical data.',
                    icon: <Clock style={{color: '#347433'}} size={24} />
                  },
                  { 
                    title: 'Anonymous Protection',
                    content: 'Revolutionary one-way anonymity system protects vulnerable vendors while ensuring complete supplier transparency and quality verification.',
                    icon: <Shield style={{color: '#347433'}} size={24} />
                  },
                  { 
                    title: 'Complete Raw Material Access',
                    content: 'Fresh vegetables, spices, cooking oils, packaging materials, disposables, and specialty ingredients - all with 15-20% cost savings.',
                    icon: <Package style={{color: '#347433'}} size={24} />
                  }
                ].map(({ title, content, icon }) => (
                  <div key={title} className="flex items-start space-x-4 md:space-x-6">
                    <div className="mt-1">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 md:mb-2 text-base md:text-lg" style={{color: '#347433'}}>{title}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Phone style={{color: '#347433'}} size={20} />
                  <p className="text-gray-700">+91 98765 43210</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail style={{color: '#347433'}} size={20} />
                  <p className="text-gray-700">support@supplymind.ai</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin style={{color: '#347433'}} size={20} />
                  <p className="text-gray-700">Mumbai, India</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl mt-4 md:mt-7" style={{ border: '1px solid rgba(52, 116, 51, 0.2)' }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Started with SupplyMind</h3>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                    style={{ '--tw-ring-color': '#347433' }}
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                    style={{ '--tw-ring-color': '#347433' }}
                    required
                    disabled={isLoading}
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  style={{ '--tw-ring-color': '#347433' }}
                  required
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  style={{ '--tw-ring-color': '#347433' }}
                  required
                  disabled={isLoading}
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your street food business and raw material needs"
                  rows="4"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-300 resize-none text-sm md:text-base"
                  style={{ '--tw-ring-color': '#347433' }}
                  required
                  disabled={isLoading}
                ></textarea>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white px-4 md:px-6 py-3 md:py-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ background: 'linear-gradient(135deg, #347433 0%, #2d5f2d 100%)' }}
                >
                  {isLoading ? 'Sending...' : 'Get Started'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Technology Features Section */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our AI-Powered Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AI VISION SCANNER",
                description: "Smart inventory analysis using computer vision technology to scan your stall and predict demand patterns with 85-90% accuracy",
                icon: "📱"
              },
              {
                title: "ANONYMOUS MARKETPLACE",
                description: "One-way anonymity system protects street vendors while ensuring complete supplier transparency and quality verification",
                icon: "�"
              },
              {
                title: "SMART RECOMMENDATIONS",
                description: "Weather-based predictions, local event analysis, and optimal quantity suggestions powered by machine learning",
                icon: "🧠"
              },
              {
                title: "SURPLUS BUYBACK",
                description: "Zero-waste guarantee with 60-70% buyback rates on excess materials, creating a circular economy model",
                icon: "♻️"
              },
              {
                title: "BULK ORDERING",
                description: "Volume discounts, group purchasing power, and wholesale pricing access for maximum cost savings",
                icon: "📦"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3" style={{color: '#347433'}}>{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="h-[300px] md:h-[400px] w-full mt-8 md:mt-16">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709427!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1680678474695!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SupplyMind Office Location"
          ></iframe>
        </div>
      </main>

      <Footer />
    </div>
  );
}