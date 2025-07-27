// components/LoadingSpinner.jsx - Reusable loading spinner component
"use client";

import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`} 
      />
      {showText && text && (
        <p className={`mt-2 text-gray-600 ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loading spinner
export const FullPageSpinner = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

// Inline loading spinner
export const InlineSpinner = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner 
    size={size} 
    showText={false} 
    className={className} 
  />
);

// Button loading spinner
export const ButtonSpinner = ({ size = 'sm' }) => (
  <Loader2 
    className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin text-white`} 
  />
);

export default LoadingSpinner; 