import { useState } from 'react';

const StepBaseline = ({ onNext, onBack }) => {
  const [text, setText] = useState('');

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const progress = Math.min(wordCount / 150, 1);
  const canContinue = wordCount >= 10;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[var(--s2)] rounded-3xl p-8 md:p-12">
        {/* PROGRESS BARS */}
        <div className="flex gap-2 w-32 mb-10">
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
        </div>

        {/* HEADING */}
        <h1 className="font-serif italic text-4xl md:text-5xl text-[var(--t1)] leading-tight mb-4">
          One last thing — write freely.
        </h1>

        {/* SUBTEXT */}
        <p className="font-sans text-[var(--t2)] text-lg leading-relaxed mb-10">
          This isn't a test. It's your starting point — a snapshot of where you are today, before any lessons begin.
        </p>

        {/* JOURNAL CARD */}
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-2xl p-6 md:p-8 mb-12">
          {/* Glyph */}
          <div className="text-center text-xl text-terracotta mb-3">✦</div>

          {/* Prompt */}
          <p className="font-serif text-xl md:text-2xl italic text-[var(--t1)] leading-snug text-center mb-4">
            "Think of a conversation that mattered to you recently — one where you felt heard, or didn't. Describe what happened in your own words."
          </p>

          {/* Note */}
          <p className="font-serif italic text-sm text-[var(--t3)] text-center mb-4">
            No right answer. No evaluation.<br />
            Just you, writing honestly.
          </p>

          {/* Divider */}
          <div className="h-px bg-[#2A1E16]/20 mb-4" />

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write freely here…"
            className="font-serif italic text-xl text-[var(--t1)] bg-transparent border-none resize-none outline-none w-full min-h-[180px] placeholder:text-stone-700 placeholder:italic"
          />

          {/* Word count row */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-[var(--t3)] whitespace-nowrap">
              {wordCount} words
            </span>
            <div className="h-1 flex-1 bg-[var(--border2)] rounded overflow-hidden">
              <div
                className="h-full bg-terracotta rounded transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-xs text-[var(--t3)] whitespace-nowrap">~150</span>
          </div>
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
            Step 3 of 3
          </span>

          <button
            onClick={() => onNext(text)}
            disabled={!canContinue}
            className="bg-terracotta text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save my baseline →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepBaseline;
