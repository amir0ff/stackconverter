import React from 'react';
import { XCircle } from 'lucide-react';
import { ErrorBannerProps } from '../types';

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="max-w-2xl mx-auto mb-4 flex items-center bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg">
      <XCircle className="mr-2 h-5 w-5" />
      <span className="flex-1">{error}</span>
      <button 
        onClick={onDismiss} 
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner; 