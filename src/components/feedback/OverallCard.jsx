import React from 'react';

const OverallCard = ({ text, isSpoken }) => {
  return (
    <div className="bg-[var(--s1)] border-l-4 border-terracotta rounded-r-xl p-8">
      <div className="text-[10px] uppercase tracking-[0.13em] text-terracotta font-bold mb-3">
        OVERALL
      </div>
      <p className="font-serif italic text-lg text-[var(--t3)] leading-relaxed">
        {text}
        {isSpoken && (
          <span className="text-[var(--t3)]">
            {' '}A human reviewer will tell you whether this lands emotionally. That part, AI can't assess.
          </span>
        )}
      </p>
    </div>
  );
};

export default OverallCard;
