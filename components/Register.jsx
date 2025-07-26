"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Shield, Smartphone } from 'lucide-react';

const Input = ({ label, type, placeholder, value, onChange, error }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            className={`w-full px-3 sm:px-4 py-2 rounded border ${
                error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

const Button = ({ children, variant = "primary", onClick, type = "button", disabled = false }) => {
    const baseStyles = "w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded transition-all duration-300 flex items-center justify-center";
    const variants = {
        primary: "bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white hover:opacity-90 disabled:opacity-70 transform hover:scale-105 shadow-lg"
    };
    
    return (
        <button 
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-5">
        <div className="bg-green-100 p-3 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-gray-900 font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vendorName: '',
        email: '',
        phone: '',
        stallAddress: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.vendorName.trim()) {
            newErrors.vendorName = 'Vendor name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.stallAddress.trim()) {
            newErrors.stallAddress = 'Stall address is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendorName: formData.vendorName,
                    email: formData.email,
                    phone: formData.phone,
                    stallAddress: formData.stallAddress,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            router.push('/login');
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Registration failed. Please try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
           
            
            <section className="flex-grow relative py-12 bg-gradient-to-br from-green-50 via-gray-50 to-white">
                <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
                    <svg className="absolute left-0 top-0 h-full" viewBox="0 0 150 800" fill="none">
                        <path d="M-5 0H50L-5 200V0Z" fill="#16A34A" />
                        <path d="M-5 200H50L-5 400V200Z" fill="#22C55E" />
                        <path d="M-5 400H50L-5 600V400Z" fill="#4ADE80" />
                        <path d="M-5 600H50L-5 800V600Z" fill="#86EFAC" />
                    </svg>
                    <svg className="absolute right-0 bottom-0 h-full" viewBox="0 0 150 800" fill="none">
                        <path d="M155 800H100L155 600V800Z" fill="#16A34A" />
                        <path d="M155 600H100L155 400V600Z" fill="#22C55E" />
                        <path d="M155 400H100L155 200V400Z" fill="#4ADE80" />
                        <path d="M155 200H100L155 0V200Z" fill="#86EFAC" />
                    </svg>
                </div>
                
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Left side - Benefits */}
                            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hidden md:block">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Join SupplyMind</h2>
                                    <p className="text-gray-600">
                                        Create your vendor account to access AI-powered supply chain solutions with:
                                    </p>
                                </div>
                                
                                <div className="space-y-6">
                                    <FeatureCard 
                                        icon={<Smartphone className="h-6 w-6 text-green-600" />}
                                        title="AI Inventory Scanning"
                                        description="Point your camera at your stall and let AI analyze inventory levels and predict demand."
                                    />
                                    <FeatureCard 
                                        icon={<Shield className="h-6 w-6 text-green-600" />}
                                        title="Anonymous Protection"
                                        description="Your identity is protected while you access verified suppliers with complete transparency."
                                    />
                                    <FeatureCard 
                                        icon={<Store className="h-6 w-6 text-green-600" />}
                                        title="Surplus Buyback"
                                        description="Zero waste guarantee - we buy back your excess raw materials at guaranteed rates."
                                    />
                                </div>
                                
                                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                                    <p className="text-green-800 text-sm italic">
                                        "SupplyMind has revolutionized how I source raw materials. I save 3 hours daily and get better prices!"
                                    </p>
                                    <p className="text-right text-green-600 font-semibold text-sm mt-2">
                                        — Rajesh Kumar, Street Food Vendor
                                    </p>
                                </div>
                            </div>
                            
                            {/* Right side - Registration form */}
                            <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Vendor Account</h2>
                                    <p className="text-gray-600">Join thousands of vendors already using SupplyMind</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Vendor Name"
                                            type="text"
                                            placeholder="Your Name"
                                            value={formData.vendorName}
                                            onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                                            error={errors.vendorName}
                                        />
                                        
                                        <Input
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="Your Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            error={errors.phone}
                                        />
                                    </div>
                                    
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        error={errors.email}
                                    />
                                    
                                    <Input
                                        label="Stall Address"
                                        type="text"
                                        placeholder="Complete address of your food stall"
                                        value={formData.stallAddress}
                                        onChange={(e) => setFormData({...formData, stallAddress: e.target.value})}
                                        error={errors.stallAddress}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            error={errors.password}
                                        />
                                        
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            error={errors.confirmPassword}
                                        />
                                    </div>

                                    <div className="flex items-start mt-4">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                                        />
                                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                                            I agree to the{' '}
                                            <a href="#" className="text-green-600 hover:underline">
                                                Terms of Service
                                            </a>{' '}
                                            and{' '}
                                            <a href="#" className="text-green-600 hover:underline">
                                                Privacy Policy
                                            </a>
                                        </label>
                                    </div>

                                    {errors.submit && (
                                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                                            {errors.submit}
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
                                            {isLoading ? 'Creating Account...' : 'Create Vendor Account'}
                                        </Button>
                                    </div>
                                </div>
                                
                                <p className="mt-6 text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/login" className="font-semibold text-green-600 hover:text-green-500">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
           
        </div>
    );
}