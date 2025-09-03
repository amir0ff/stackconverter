import React from 'react';
import { Code, RefreshCw } from 'lucide-react';
import { ConvertButtonProps } from '../types';

const ConvertButton: React.FC<ConvertButtonProps> = ({
  onClick,
  disabled,
  isConverting,
}) => {
  return (
    <div className="flex justify-center mb-8">
      <button 
        onClick={onClick}
        disabled={disabled}
        className="bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white hover:from-gray-900 hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-gray-200 disabled:from-gray-400 disabled:to-gray-500 text-white dark:text-black font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center space-x-2 disabled:cursor-not-allowed"
      >
        {isConverting ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Converting...</span>
          </>
        ) : (
          <>
            <Code className="h-5 w-5" />
            <span>Convert Stack</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ConvertButton; 