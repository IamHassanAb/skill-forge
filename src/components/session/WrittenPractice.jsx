import React, { useState } from 'react';

const WrittenPractice = ({ prompt, onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const canSubmit = !isLoading && text.trim() !== '';

  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-2xl p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--t3)] flex-shrink-0">
          PRACTICE
        </span>
        <div className="h-px flex-1 bg-[#2A1E16]" />
      </div>

      {/* PROMPT */}
      <p className="font-serif text-2xl md:text-3xl text-[var(--t1)] leading-snug mb-6">
        {prompt}
      </p>

      {/* TEXTAREA */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your response here…"
        className="w-full h-48 bg-[var(--s2)] border-none rounded-xl text-[var(--t1)] placeholder:text-[var(--t4)] focus:ring-1 focus:ring-terracotta/20 transition-all p-6 text-base leading-relaxed resize-none outline-none"
      />

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-[var(--t4)] text-xs font-medium tabular-nums">
          {wordCount} / 150–300 words
        </span>

        <button
          onClick={() => onSubmit(text)}
          disabled={!canSubmit}
          className="bg-terracotta text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            'Submit →'
          )}
        </button>
      </div>
    </div>
  );
};

export default WrittenPractice;
