import React from 'react';
import { Zap, Github } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center justify-center flex-1">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-2 sm:p-3 mr-2 sm:mr-4 border border-amber-200 dark:border-amber-800/30">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 dark:text-yellow-300" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">StackConverter</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/amir0ff/stackconverter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent hover:text-accent-foreground border border-border bg-card/50 backdrop-blur-sm"
            aria-label="View on GitHub"
          >
            <Github className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
          </a>
          <ThemeToggle />
        </div>
      </div>
      <p className="text-muted-foreground text-md">Multi-Framework AI Codebase Converter</p>
      <div className="mt-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full text-gray-700 dark:text-gray-300 text-sm inline-block border border-gray-300 dark:border-gray-600">
        🚀 Transform your entire codebase between different tech stacks
      </div>
    </div>
  );
};

export default Header; 