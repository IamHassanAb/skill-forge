import React from 'react';

const StepComplete = ({ stages, focusAreas, context, onBegin }) => {
  const tags = [...focusAreas, context];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* OUTER WRAPPER */}
        <div className="flex flex-col items-center">
          {/* PROGRESS BARS */}
          <div className="flex gap-2 w-32 mb-12">
            <div className="flex-1 h-1 rounded-full bg-terracotta" />
            <div className="flex-1 h-1 rounded-full bg-terracotta" />
            <div className="flex-1 h-1 rounded-full bg-terracotta" />
          </div>

          {/* GLYPH BADGE */}
          <div className="w-16 h-16 rounded-full bg-terracotta/10 border border-terracotta/25 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-terracotta">✦</span>
          </div>

          {/* HEADING */}
          <h1 className="font-serif italic text-4xl md:text-5xl text-[var(--t1)] leading-tight text-center mb-4">
            Your plan is ready.
          </h1>

          {/* SUBTEXT */}
          <p className="font-sans text-[var(--t2)] text-lg leading-relaxed text-center max-w-lg mb-8">
            Based on your focus areas, Situo has built a personalised 5-stage study plan. Your first spark is waiting.
          </p>

          {/* TAGS ROW */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs bg-terracotta/10 text-terracotta border border-terracotta/10"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* STUDY PLAN PREVIEW CARD */}
          <div className="bg-[var(--s2)] rounded-3xl p-8 w-full mb-6">
            <div className="text-[10px] uppercase tracking-widest text-[var(--t3)] font-bold mb-6">
              YOUR STUDY PLAN
            </div>

            <div className="space-y-3">
              {stages.map((stage, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isFirst
                        ? 'bg-[var(--border2)] border border-terracotta/20'
                        : ''
                    }`}
                  >
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                        isFirst
                          ? 'bg-terracotta text-white font-bold'
                          : 'border border-[#55423e] text-[var(--t3)]'
                      }`}
                    >
                      {stage.id}
                    </div>

                    {/* Title */}
                    <span
                      className={`font-sans ${
                        isFirst
                          ? 'text-terracotta font-semibold'
                          : 'text-[var(--t2)]'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BEGIN BUTTON */}
          <button
            onClick={onBegin}
            className="w-full py-5 rounded-2xl font-bold bg-terracotta text-white hover:opacity-90 transition-all text-lg"
          >
            Begin Stage 1 →
          </button>

          {/* NOTE */}
          <p className="text-[var(--t3)] text-sm text-center mt-4">
            You can always update your focus areas in settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepComplete;
