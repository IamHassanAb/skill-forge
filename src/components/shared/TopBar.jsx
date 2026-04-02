import React from 'react';

const TopBar = ({ stageTitle, sessionLabel }) => {
  return (
    <div className="h-14 px-8 flex items-center justify-between border-b border-[var(--border)] flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-terracotta">
          {stageTitle}
        </span>
        {sessionLabel && (
          <>
            <span className="text-[var(--t4)]">·</span>
            <span className="text-[10px] text-[var(--t3)] uppercase tracking-widest">
              {sessionLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
