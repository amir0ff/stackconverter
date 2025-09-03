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
        className="appearance-none bg-card border border-border rounded-xl px-6 py-3 text-card-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent pr-12 pl-12 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {stackOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        {selectedStack?.icon}
      </div>
      <FileCode className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
    </div>
  );
};

export default StackSelector; 