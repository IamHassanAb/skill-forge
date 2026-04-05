import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ goalTitle, stages, confidenceLevel, onSettingsClick }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="fixed left-0 top-0 w-[210px] h-screen bg-[var(--s1)] border-r border-[var(--border)] flex flex-col font-sans z-50">
      {/* 1. LOGO */}
      <div className="px-6 pt-8 pb-6 border-b border-[var(--border)]">
        <div className="flex items-start">
          <span className="font-serif italic text-2xl text-[var(--t1)] leading-none">Situo</span>
          <div className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 ml-1" />
        </div>
      </div>

      {/* 2. CURRENT GOAL */}
      <div className="px-6 py-6 border-b border-[var(--border)]">
        <div className="text-[10px] uppercase tracking-widest text-[var(--t3)] font-bold mb-2">
          CURRENT GOAL
        </div>
        <div className="text-sm text-[var(--t1)] font-medium leading-tight">
          {goalTitle}
        </div>
      </div>

      {/* 3. STAGE TIMELINE */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="relative">
          <div className="absolute left-[7px] top-1 w-px h-full bg-[var(--border)]" />
          
          <div className="flex flex-col gap-6">
            {stages.map((stage, idx) => {
              const isDone = stage.status === 'done';
              const isActive = stage.status === 'active';
              const isUpcoming = stage.status === 'upcoming';
              const isLast = idx === stages.length - 1;

              return (
                <div key={stage.id} className="relative flex items-start gap-4">
                  {/* Connector line to next for done items */}
                  {isDone && !isLast && (
                    <div className="absolute left-[7px] top-[14px] bottom-[-24px] w-px bg-terracotta" />
                  )}

                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    {isDone && (
                      <div className="w-3.5 h-3.5 bg-terracotta rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-[var(--s1)]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {isActive && (
                      <div className="w-3.5 h-3.5 bg-terracotta rounded-full shadow-[0_0_12px_rgba(194,98,74,0.5)]" />
                    )}
                    {isUpcoming && (
                      <div className="w-3.5 h-3.5 border border-[var(--border2)] bg-[var(--s1)] rounded-full" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    {isActive ? (
                      <>
                        <span className="text-xs text-terracotta font-semibold leading-none mt-0.5">Stage {stage.id}</span>
                        <span className="text-[13px] text-[var(--t1)] font-medium leading-tight mt-1.5">{stage.title}</span>
                        <span className="text-[11px] text-[var(--t3)] italic mt-0.5">Session {stage.sessionCount} of {stage.totalSessions}</span>
                      </>
                    ) : (
                      <span className={`text-xs mt-0.5 leading-none ${isDone ? 'text-[var(--t3)]' : 'text-[var(--t4)]'}`}>
                        {stage.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION */}
      <div className="mt-auto px-6 py-6 border-t border-[var(--border)] flex flex-col">
        <div className="mb-4">
          <ConfidenceBadge level={confidenceLevel} />
        </div>
        
        <div className="flex flex-col gap-3">
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-[var(--t3)] hover:text-[var(--t1)] transition-colors text-sm w-full"
          >
            {theme === 'dark' ? (
              <>
                <span className="material-symbols-outlined text-lg">light_mode</span>
                <span>Light theme</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">dark_mode</span>
                <span>Dark theme</span>
              </>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-2 text-[var(--t3)] hover:text-[var(--t1)] transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span>Settings</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Sidebar;
