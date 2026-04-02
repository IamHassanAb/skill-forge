import React from 'react';

const FeedbackActions = ({ onRequestReview, onContinue, isSpoken }) => {
  return (
    <div className="fixed bottom-8 left-[calc(210px+2rem)] right-8 z-30">
      <div className="bg-[var(--s2)]/80 backdrop-blur-xl rounded-2xl p-4 flex justify-between items-center shadow-2xl border border-[var(--border2)]">
        {isSpoken ? (
          <>
            {/* SPOKEN: Human review is PRIMARY */}
            <button
              onClick={onRequestReview}
              className="bg-terracotta text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-terracotta/20 hover:brightness-110 transition-all cursor-pointer"
            >
              Request Human Review
            </button>
            <button
              onClick={onContinue}
              className="border border-[var(--border2)] text-[var(--t3)]/60 hover:text-[var(--t3)] px-8 py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* WRITTEN: Continue is PRIMARY */}
            <button
              onClick={onRequestReview}
              className="border border-terracotta/30 text-terracotta px-6 py-3 rounded-xl font-bold text-sm hover:bg-terracotta/5 transition-all cursor-pointer"
            >
              Request Human Review
            </button>
            <button
              onClick={onContinue}
              className="bg-terracotta text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:opacity-90 cursor-pointer"
            >
              Continue to next session →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackActions;
