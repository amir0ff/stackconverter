import React from 'react';
import { FeaturesSectionProps } from '../types';

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className={`text-2xl mb-4 ${feature.color}`}>{feature.icon}</div>
          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-300 text-sm">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesSection; 