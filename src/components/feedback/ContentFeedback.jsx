import React from 'react';

const ContentFeedback = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="bg-[#231f1c] border border-[#2A1E16] rounded-xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
              {cat.name}
            </span>
            <span className="text-xs text-terracotta font-bold">
              {cat.score}/5
            </span>
          </div>

          {/* Score pips */}
          <div className="flex gap-1.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i < cat.score ? 'bg-terracotta' : 'bg-[#393431]'
                }`}
              />
            ))}
          </div>

          {/* Note */}
          <p className="text-xs text-stone-400 leading-relaxed font-light mt-2">
            {cat.note}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ContentFeedback;
