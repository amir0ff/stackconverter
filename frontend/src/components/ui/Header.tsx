import React from 'react';
import { Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center flex-1">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-3 mr-4 border border-amber-200 dark:border-amber-800/30">
            <Zap className="h-8 w-8 text-yellow-400 dark:text-yellow-300" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">StackConverter</h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground text-md">Multi-Framework AI Codebase Converter</p>
      <div className="mt-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-700 dark:text-gray-300 text-sm inline-block border border-gray-300 dark:border-gray-600">
        🚀 Transform your entire codebase between different tech stacks
      </div>
    </div>
  );
};

export default Header; 