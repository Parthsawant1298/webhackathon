"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    const baseStyles = "w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded transition-colors duration-200 flex items-center justify-center";
    const variants = {
        primary: "bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white hover:opacity-90 disabled:opacity-70"
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

export default function SupplierLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setErrors({}); // Clear previous errors
        
        try {
            const response = await fetch('/api/supplier/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store supplier data in localStorage for immediate access
            if (data.supplier) {
                localStorage.setItem('supplier', JSON.stringify(data.supplier));
            }

            // Redirect to supplier dashboard
            router.push('/supplier/dashboard');
            
        } catch (error) {
            console.error('Login error:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Login failed. Please check your connection and try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <section className="flex-grow relative py-12 md:py-20 bg-gradient-to-br from-green-50 via-gray-50 to-white">
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
                    <div className="max-w-md mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back Supplier</h2>
                                <p className="text-gray-600">Sign in to access your SupplyMind account and manage your supply network</p>
                            </div>

                            {/* Test Credentials Note */}
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="text-sm text-green-800">
                                    <p className="font-medium mb-2">Test Supplier Credentials:</p>
                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <p><strong>Supplier 1:</strong></p>
                                            <p>• Email: thanemasala.kharkar@gmail.com</p>
                                            <p>• Password: abc@123</p>
                                        </div>
                                        <div>
                                            <p><strong>Supplier 2:</strong></p>
                                            <p>• Email: sitaramagro.flavours@gmail.com</p>
                                            <p>• Password: sitaram$78</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-5">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    error={errors.email}
                                />
                                
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    error={errors.password}
                                />
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input 
                                            id="remember-me" 
                                            name="remember-me" 
                                            type="checkbox"
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                <Button onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                {errors.submit && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                                        {errors.submit}
                                    </div>
                                )}
                            </div>
                            
                            <p className="mt-8 text-center text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <Link href="/supplier/register" className="font-semibold text-green-600 hover:text-green-500">
                                    Create supplier account
                                </Link>
                            </p>
                        </div>
                        
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                By signing in, you agree to our{' '}
                                <a href="/terms-of-use" className="text-green-600 hover:underline">Terms of Service</a>{' '}
                                and{' '}
                                <a href="/privacy-policy" className="text-green-600 hover:underline">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}