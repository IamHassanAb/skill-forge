import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import the hook

const ConfidenceBadge = ({ level }) => {
  const { toggleTheme } = useTheme(); // Access the toggle function
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
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-sans text-xs font-medium cursor-pointer transition-all hover:opacity-80 active:scale-95 text-[var(--t1)] ${styleConfig.bg} ${styleConfig.border}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${styleConfig.dot}`}></div>
      <span>{level} confidence</span>
    </button>
  );
};

export default ConfidenceBadge;
