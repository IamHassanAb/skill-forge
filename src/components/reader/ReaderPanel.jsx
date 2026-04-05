
const ReaderPanel = ({ isOpen, source, type, readTime, title, summary, onClose, onGoToPractice }) => {
  const paragraphs = summary
    ? summary.split(/\n\n|\n/).filter((p) => p.trim() !== '')
    : [];

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Overlay — offset to avoid covering sidebar */}
      <div
        className={`fixed left-[210px] right-0 top-0 bottom-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-[70%] bg-[var(--s1)] border-l border-[var(--border)] flex flex-col z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* HEADER */}
        <div className="h-20 px-10 flex items-center justify-between border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-serif italic text-[var(--t1)]">{source}</span>
            <span className="text-[var(--t4)]">·</span>
            <span className="text-[var(--t3)]">{type}</span>
            <span className="text-[var(--t4)]">·</span>
            <span className="text-[var(--t3)]">{readTime}</span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--t3)] hover:text-terracotta transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-10 py-16">
          <h1 className="font-serif text-5xl text-[var(--t1)] leading-tight mb-6">
            {title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-[var(--t3)] mb-12">
            <span>{source}</span>
            <span>·</span>
            <span>{type}</span>
            <span>·</span>
            <span>{readTime}</span>
          </div>

          <div className="font-sans font-light text-[var(--t2)] text-lg leading-[1.8] space-y-6 max-w-2xl">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA BAR */}
        <div className="h-24 px-10 bg-[#231A14] flex items-center justify-between border-t border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-terracotta text-lg">✦</span>
            <span className="font-serif italic text-[var(--t2)] text-sm">
              Ready to practice?
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[var(--border2)] text-[var(--t3)] hover:text-[var(--t1)] hover:border-stone-500 transition-all text-sm font-medium cursor-pointer"
            >
              Keep reading
            </button>
            <button
              onClick={() => {
                onGoToPractice();
                onClose();
              }}
              className="px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              Go to practice →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderPanel;
