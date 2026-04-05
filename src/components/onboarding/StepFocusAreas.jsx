import { useState } from 'react';
import { CANONICAL_FOCUS_AREAS } from '../../data/focusAreaMap';

const StepFocusAreas = ({ onNext }) => {
  const [selected, setSelected] = useState([]);

  const toggleArea = (key) => {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[var(--s2)] rounded-3xl p-8 md:p-12">
        {/* 1. LOGO */}
        <div className="mb-8">
          <span className="font-serif italic text-3xl text-terracotta">Situo</span>
        </div>

        {/* 2. PROGRESS BARS */}
        <div className="flex gap-2 w-32 mb-10">
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-[var(--border2)]" />
          <div className="flex-1 h-1 rounded-full bg-[var(--border2)]" />
        </div>

        {/* 3. HEADING */}
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--t1)] leading-tight mb-4">
          What do you most want to improve?
        </h1>

        {/* 4. SUBTEXT */}
        <p className="font-sans text-[var(--t2)] text-lg leading-relaxed mb-10">
          Select all that apply. Your study plan will be built around these areas — you can adjust later.
        </p>

        {/* 5. CHIP GRID */}
        <div className="flex flex-wrap gap-3 mb-12">
          {Object.entries(CANONICAL_FOCUS_AREAS).map(([key, { label }]) => {
            const isSelected = selected.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleArea(key)}
                className={`px-6 py-3 rounded-full font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-terracotta text-white font-medium'
                    : 'border border-[#55423e] text-[#dbc1ba] hover:border-terracotta hover:text-[var(--t1)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 6. FOOTER */}
        <div className="flex items-center justify-between">
          <span className="text-[var(--t3)] text-xs uppercase tracking-widest">
            Step 1 of 3
          </span>
          <button
            onClick={() => onNext(selected)}
            disabled={selected.length === 0}
            className="bg-terracotta text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFocusAreas;
