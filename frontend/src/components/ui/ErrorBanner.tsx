import React from 'react';
import { XCircle } from 'lucide-react';
import { ErrorBannerProps } from '../types';

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="max-w-2xl mx-auto mb-4 flex items-center bg-red-500/90 dark:bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg border border-red-600 dark:border-red-700">
      <XCircle className="mr-2 h-5 w-5" />
      <span className="flex-1">{error}</span>
      <button 
        onClick={onDismiss} 
        className="ml-4 text-white hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner; 