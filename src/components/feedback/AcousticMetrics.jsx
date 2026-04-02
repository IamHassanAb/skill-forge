import React from 'react';

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const Badge = ({ label, variant }) => {
  const colors =
    variant === 'amber'
      ? 'bg-[#C9912A]/10 text-[#C9912A] border-[#C9912A]/20'
      : 'bg-terracotta/10 text-terracotta border-terracotta/20';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors}`}>
      {label}
    </span>
  );
};

const AcousticMetrics = ({ pace, talkTime, totalTime = 90, fillerWords, pauses }) => {
  const talkPct = Math.round((talkTime / totalTime) * 100);
  const totalFillers = fillerWords.reduce((sum, f) => sum + f.count, 0);
  const pauseCount = pauses.length;

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-1">
          ACOUSTIC MEASUREMENTS
        </div>
        <div className="text-[9px] text-stone-600">
          via AssemblyAI · objective data only
        </div>
      </div>

      {/* Two-card grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* PACE CARD */}
        <div className="bg-[#231f1c] border border-[#2A1E16] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
              SPEAKING PACE
            </span>
            <Badge label={pace > 160 ? 'Fast' : 'Good'} variant={pace > 160 ? 'amber' : 'terracotta'} />
          </div>
          <div className="text-3xl font-light text-stone-100 tabular-nums mb-3">
            {pace} <span className="text-sm text-stone-500">wpm</span>
          </div>
          {/* Progress track */}
          <div className="relative h-1.5 bg-[#393431] rounded-full mb-2 overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full ${pace > 160 ? 'bg-[#C9912A]' : 'bg-terracotta'}`}
              style={{ width: `${Math.min((pace / 200) * 100, 100)}%` }}
            />
            {/* Comfortable range marker */}
            <div
              className="absolute top-0 h-full border-l border-r border-stone-500/30"
              style={{ left: '60%', width: '20%' }}
            />
          </div>
          <p className="text-[11px] text-stone-500 font-light">
            Comfortable range is 120–160 wpm.
          </p>
        </div>

        {/* TALK TIME CARD */}
        <div className="bg-[#231f1c] border border-[#2A1E16] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
              TALK TIME
            </span>
            <Badge label={`${talkPct}% · Good`} variant="terracotta" />
          </div>
          <div className="text-3xl font-light text-stone-100 tabular-nums mb-3">
            {formatTime(talkTime)}
          </div>
          {/* Progress track */}
          <div className="h-1.5 bg-[#393431] rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full"
              style={{ width: `${talkPct}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500 font-light">
            {formatTime(talkTime)} of speech in {formatTime(totalTime)} total.
          </p>
        </div>
      </div>

      {/* FILLER WORDS CARD (full width) */}
      <div className="bg-[#231f1c] border border-[#2A1E16] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
            FILLER WORDS
          </span>
          <span className="text-xs text-[#C9912A] font-bold tabular-nums">
            {totalFillers} total
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {fillerWords.map((f) => (
            <span
              key={f.word}
              className="px-3 py-1 rounded-full text-xs bg-[#C9912A]/10 text-[#C9912A] border border-[#C9912A]/15 font-medium"
            >
              "{f.word}" × {f.count}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-stone-500 font-light">
          Filler words are natural but awareness helps reduce overuse.
        </p>
      </div>

      {/* PAUSE DETECTION CARD (full width) */}
      <div className="bg-[#231f1c] border border-[#2A1E16] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
            PAUSES DETECTED
          </span>
          <span className="text-xs text-stone-400 font-bold tabular-nums bg-[#393431] px-2 py-0.5 rounded">
            {pauseCount}
          </span>
        </div>
        {/* Visual timeline */}
        <div className="flex items-center gap-0.5 h-6 mb-3">
          {pauses.map((p, i) => (
            <React.Fragment key={i}>
              {/* Speech segment */}
              <div
                className="h-full bg-terracotta/20 rounded-sm flex-1 min-w-[20px]"
              />
              {/* Pause segment */}
              <div
                className="h-full bg-terracotta rounded-sm relative flex items-center justify-center"
                style={{ width: `${Math.max(p.duration * 8, 16)}px` }}
              >
                <span className="text-[8px] text-white font-bold">
                  {p.duration.toFixed(1)}s
                </span>
              </div>
            </React.Fragment>
          ))}
          {/* Trailing speech segment */}
          <div className="h-full bg-terracotta/20 rounded-sm flex-1 min-w-[20px]" />
        </div>
        <p className="text-[11px] text-stone-500 font-light">
          Strategic pauses add emphasis and give the listener time to absorb key points.
        </p>
      </div>
    </div>
  );
};

export default AcousticMetrics;
