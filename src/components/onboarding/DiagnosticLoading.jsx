import { useState, useEffect } from 'react';

const ITEMS = [
  'Identifying your strengths',
  'Spotting growth areas',
  'Recognising patterns',
  'Building your focus plan',
];

// Delay (ms) after mount before each item ticks complete
const DELAYS = [1200, 2600, 4000, 5400];

const DiagnosticLoading = ({ onComplete }) => {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers = DELAYS.map((delay, i) =>
      setTimeout(() => setCompletedCount(i + 1), delay)
    );
    const doneTimer = setTimeout(() => onComplete?.(), 2500);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer); };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-12 px-6"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* ── 1. TOP ICON ─────────────────────────────────────────── */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          border: '2px solid rgba(194, 98, 74, 0.4)',
        }}
      >
        <span
          className="material-symbols-outlined text-terracotta"
          style={{ fontSize: '2rem' }}
        >
          edit_note
        </span>
      </div>

      {/* ── 2. HEADING + SUBTEXT ────────────────────────────────── */}
      <div className="flex flex-col items-center gap-0">
        <h1 className="font-serif text-3xl md:text-4xl text-stone-100 font-medium text-center">
          Reading your response
        </h1>
        <p className="text-stone-500 text-base max-w-sm text-center leading-relaxed mt-3">
          We&rsquo;re finding what&rsquo;s working and where your plan should focus
        </p>
      </div>

      {/* ── 3. CHECKLIST ────────────────────────────────────────── */}
      <ul className="max-w-md w-full space-y-3">
        {ITEMS.map((label, i) => {
          const isDone = i < completedCount;
          const isActive = i === completedCount; // currently in progress

          return (
            <li
              key={label}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{
                backgroundColor: 'var(--s1)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Left: dot + label */}
              <div className="flex items-center gap-3">
                <span
                  className={[
                    'w-2 h-2 rounded-full flex-shrink-0 bg-terracotta',
                    isActive ? 'animate-pulse' : '',
                    isDone ? 'opacity-40' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
                <span
                  className={[
                    'text-sm font-medium transition-colors duration-500',
                    isDone ? 'text-stone-400' : 'text-stone-200',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>

              {/* Right: checkmark (visible only when done) */}
              <span
                className={[
                  'text-terracotta text-sm font-medium transition-opacity duration-500',
                  isDone ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                aria-hidden={!isDone}
              >
                ✓
              </span>
            </li>
          );
        })}
      </ul>

      {/* ── 4. FOOTER NOTE ──────────────────────────────────────── */}
      <p className="font-serif italic text-stone-600 text-sm mt-4">
        This takes about 10 seconds
      </p>
    </div>
  );
};

export default DiagnosticLoading;
