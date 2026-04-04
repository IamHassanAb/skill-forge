import React from 'react';

/* ─── Helper: section card ─────────────────────────────────────────────────── */

const SectionCard = ({ className = '', style = {}, children }) => (
  <div
    className={`rounded-2xl p-6 ${className}`}
    style={{
      backgroundColor: 'var(--s1)',
      border: '1px solid var(--border)',
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-terracotta"
      aria-hidden="true"
    />
    <span className="text-[10px] uppercase tracking-[0.15em] text-terracotta font-bold">
      {label}
    </span>
  </div>
);

/* ─── Item row variants ────────────────────────────────────────────────────── */

const ArrowItem = ({ text }) => (
  <div className="flex items-start gap-2">
    <span className="text-terracotta text-sm leading-relaxed flex-shrink-0 mt-px">→</span>
    <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
  </div>
);

const CircleItem = ({ text }) => (
  <div className="flex items-start gap-2">
    <span className="text-terracotta text-sm leading-relaxed flex-shrink-0 mt-px">○</span>
    <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
  </div>
);

const DotItem = ({ text }) => (
  <div className="flex items-start gap-2">
    <span className="text-terracotta text-sm leading-relaxed flex-shrink-0 mt-px">·</span>
    <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
  </div>
);

const FilledDotItem = ({ text }) => (
  <div className="flex items-start gap-2.5">
    <span
      className="w-1.5 h-1.5 rounded-sm flex-shrink-0 bg-terracotta mt-1.5"
      aria-hidden="true"
    />
    <p className="text-stone-200 text-sm leading-relaxed font-medium">{text}</p>
  </div>
);

/* ─── Main component ───────────────────────────────────────────────────────── */

const DiagnosticResult = ({ diagnostic = {}, onContinue }) => {
  const {
    strengths = [],
    growth_areas = [],
    patterns = [],
    recommended_focus = [],
  } = diagnostic;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* ── TOP LABEL + HEADING ──────────────────────────────── */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-4 text-center">
          Your Communication Profile
        </p>

        <h1 className="font-serif italic text-4xl md:text-5xl text-stone-100 text-center mb-3">
          Here&rsquo;s what we found.
        </h1>

        <p className="text-stone-500 text-base text-center leading-relaxed mb-12 max-w-md mx-auto">
          Based on your response, here is where you stand today — before a
          single lesson begins.
        </p>

        {/* ── FOUR SECTION CARDS ──────────────────────────────── */}
        <div className="space-y-4">

          {/* Card 1 — Strengths */}
          <SectionCard>
            <CardHeader label="Strengths" />
            <div className="space-y-2.5">
              {strengths.length > 0
                ? strengths.map((item, i) => <ArrowItem key={i} text={item} />)
                : <p className="text-stone-600 text-sm italic">None identified yet.</p>
              }
            </div>
          </SectionCard>

          {/* Card 2 — Growth Areas */}
          <SectionCard>
            <CardHeader label="Growth Areas" />
            <div className="space-y-2.5">
              {growth_areas.length > 0
                ? growth_areas.map((item, i) => <CircleItem key={i} text={item} />)
                : <p className="text-stone-600 text-sm italic">None identified yet.</p>
              }
            </div>
          </SectionCard>

          {/* Card 3 — Patterns */}
          <SectionCard>
            <CardHeader label="Patterns We Noticed" />
            <div className="space-y-2.5">
              {patterns.length > 0
                ? patterns.map((item, i) => <DotItem key={i} text={item} />)
                : <p className="text-stone-600 text-sm italic">None identified yet.</p>
              }
            </div>
          </SectionCard>

          {/* Card 4 — Recommended Focus (highlighted) */}
          <SectionCard
            style={{
              backgroundColor: 'rgba(194, 98, 74, 0.05)',
              border: '1px solid rgba(194, 98, 74, 0.2)',
            }}
          >
            <CardHeader label="Recommended Starting Point" />
            <div className="space-y-2.5">
              {recommended_focus.length > 0
                ? recommended_focus.map((item, i) => <FilledDotItem key={i} text={item} />)
                : <p className="text-stone-600 text-sm italic">None identified yet.</p>
              }
            </div>
          </SectionCard>

        </div>

        {/* ── BOTTOM CTA ──────────────────────────────────────── */}
        <button
          id="diagnostic-result-continue"
          type="button"
          onClick={onContinue}
          className="w-full py-5 rounded-2xl bg-terracotta text-white font-bold text-base mt-8 transition-opacity hover:opacity-90 active:opacity-80"
        >
          See your study plan →
        </button>

        <p className="text-stone-600 text-xs text-center mt-3">
          This profile updates as you progress through your sessions.
        </p>

      </div>
    </div>
  );
};

export default DiagnosticResult;
