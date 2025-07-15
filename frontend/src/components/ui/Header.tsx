import React from 'react';
import { Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4">
          <Zap className="h-8 w-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">StackConverter</h1>
      </div>
      <p className="text-gray-300 text-md">Multi-Framework AI Codebase Converter</p>
      <div className="mt-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm inline-block">
        🚀 Transform your entire codebase between different tech stacks
      </div>
    </div>
  );
};

export default Header; 