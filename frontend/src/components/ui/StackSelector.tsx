import React from 'react';
import { FileCode } from 'lucide-react';
import { StackSelectorProps } from '../types';

const StackSelector: React.FC<StackSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  stackOptions,
}) => {
  const selectedStack = stackOptions.find(s => s.value === value);

  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={onChange}
        disabled={disabled}
        className="appearance-none bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl px-6 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 pl-12"
      >
        {stackOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">
        {selectedStack?.icon}
      </div>
      <FileCode className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default StackSelector; 