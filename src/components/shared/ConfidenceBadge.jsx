import React from 'react';

const ConfidenceBadge = ({ level }) => {
  const isHigh = level === 'High';

  const styleConfig = isHigh
    ? {
        bg: 'bg-[#4A8C5C]/10',
        border: 'border-[#4A8C5C]/20',
        dot: 'bg-[#4A8C5C]'
      }
    : {
        bg: 'bg-[#C9912A]/10',
        border: 'border-[#C9912A]/20',
        dot: 'bg-[#C9912A]'
      };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-sans text-xs font-medium text-[#EDE6DC] ${styleConfig.bg} ${styleConfig.border}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${styleConfig.dot}`}></div>
      <span>{level} confidence</span>
    </div>
  );
};

export default ConfidenceBadge;
