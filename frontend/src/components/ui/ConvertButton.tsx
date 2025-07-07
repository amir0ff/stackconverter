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
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center space-x-2"
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