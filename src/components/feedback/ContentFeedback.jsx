import React from 'react';

const ContentFeedback = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="bg-[var(--s2)] border border-[var(--border)] rounded-xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--t3)] font-semibold">
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
                  i < cat.score ? 'bg-terracotta' : 'bg-[var(--border2)]'
                }`}
              />
            ))}
          </div>

          {/* Note */}
          <p className="text-xs text-[var(--t3)] leading-relaxed font-light mt-2">
            {cat.note}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ContentFeedback;
