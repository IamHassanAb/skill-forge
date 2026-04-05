
const StepLoading = () => {
  return (
    <div role="status" aria-live="polite" className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[var(--s2)] rounded-3xl p-8 md:p-12 flex flex-col items-center">
        {/* PROGRESS BARS */}
        <div className="flex gap-2 w-32 mb-14">
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
          <div className="flex-1 h-1 rounded-full bg-terracotta" />
        </div>

        {/* PULSING GLYPH */}
        <div className="relative mb-8">
          <span className="text-6xl text-terracotta animate-pulse">✦</span>
          <span className="absolute inset-0 text-6xl text-terracotta blur-md animate-[pulse_2s_ease-in-out_infinite]">✦</span>
        </div>

        {/* HEADING */}
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--t1)] font-medium text-center mb-4">
          Building your plan…
        </h1>

        {/* SUBTEXT */}
        <p className="text-[var(--t3)] text-sm max-w-xs mx-auto text-center mb-8">
          Personalising your 5-stage study plan based on your focus areas.
        </p>

        {/* BOUNCING DOTS */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-terracotta/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-terracotta/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-terracotta/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default StepLoading;
