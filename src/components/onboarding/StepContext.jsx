import { useState } from 'react';

const CONTEXT_OPTIONS = [
  {
    value: 'Professional',
    title: 'Professional',
    desc: 'Presentations, meetings, team communication, job interviews',
  },
  {
    value: 'Social',
    title: 'Social',
    desc: 'Conversations, networking, community events, social situations',
  },
  {
    value: 'Both (Professional & Social)',
    title: 'Both',
    desc: 'I want to grow across all areas of my life',
  },
];

const StepContext = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[var(--s2)] rounded-3xl p-8 md:p-12">
        {/* PROGRESS BARS */}
        <div className="flex gap-2 w-32 mb-10">
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-[var(--border2)]" />
        </div>

        {/* HEADING */}
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--t1)] leading-tight mb-4">
          Where do you most need these skills?
        </h1>

        {/* SUBTEXT */}
        <p className="font-sans text-[var(--t2)] text-lg leading-relaxed mb-10">
          This shapes the tone and context of your lessons and practice prompts.
        </p>

        {/* OPTION CARDS */}
        <div className="space-y-4 mb-12">
          {CONTEXT_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelected(option.value)}
                className={`w-full text-left p-6 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${isSelected
                    ? 'border-terracotta/30 bg-terracotta/5'
                    : 'border-[var(--border2)] bg-[#1f1b18]'
                  }`}
              >
                {/* Radio circle */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'border-terracotta bg-terracotta'
                        : 'border-[#55423e]'
                      }`}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Text */}
                <div>
                  <div className="font-serif text-2xl text-[var(--t1)] mb-1">{option.title}</div>
                  <div className="text-[var(--t2)] text-sm leading-snug">{option.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-[var(--t3)] hover:text-[var(--t2)] transition-colors text-sm font-medium cursor-pointer"
          >
            ← Back
          </button>

          <span className="text-[var(--t3)] text-xs uppercase tracking-widest">
            Step 2 of 3
          </span>

          <button
            onClick={() => onNext(selected)}
            disabled={!selected}
            className="bg-terracotta text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepContext;
