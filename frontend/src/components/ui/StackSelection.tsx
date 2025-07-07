import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StackSelectorProps } from '../types';
import StackSelector from './StackSelector';

interface StackSelectionProps {
  sourceStack: string;
  targetStack: string;
  onSourceStackChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTargetStackChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  stackOptions: StackSelectorProps['stackOptions'];
}

const StackSelection: React.FC<StackSelectionProps> = ({
  sourceStack,
  targetStack,
  onSourceStackChange,
  onTargetStackChange,
  disabled = false,
  stackOptions,
}) => {
  return (
    <div className="flex items-center justify-center mb-8 space-x-4">
      <StackSelector
        value={sourceStack}
        onChange={onSourceStackChange}
        disabled={disabled}
        stackOptions={stackOptions}
      />
      
      <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
        <ArrowRight className="h-6 w-6 text-white" />
      </div>
      
      <StackSelector
        value={targetStack}
        onChange={onTargetStackChange}
        disabled={disabled}
        stackOptions={stackOptions}
      />
    </div>
  );
};

export default StackSelection; 