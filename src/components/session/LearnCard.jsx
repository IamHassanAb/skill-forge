import { memo } from 'react';

const highlightTerms = (text, keyTerms) => {
  if (!keyTerms || keyTerms.length === 0) return text;

  const escaped = keyTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isKey = keyTerms.some((t) => t.toLowerCase() === part.toLowerCase());
    if (isKey) {
      return (
        <span key={i} className="text-[var(--t1)] font-semibold border-b border-terracotta/30">
          {part}
        </span>
      );
    }
    return part;
  });
};

const LearnCard = memo(function LearnCard({ lessonText, keyTerms }) {
  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-2xl p-5">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--t3)] flex-shrink-0">
          LEARN
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* BODY */}
      <p className="font-sans text-lg text-[var(--t2)] leading-relaxed font-light">
        {highlightTerms(lessonText, keyTerms)}
      </p>
    </div>
  );
});

export default LearnCard;
