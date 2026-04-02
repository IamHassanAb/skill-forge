import React from 'react';

const SparkCard = ({ title, source, type, readTime, hookText, onReadFullPiece }) => {
  return (
    <div className="bg-[#1C1410] border border-[#2A1E16] rounded-2xl overflow-hidden">
      {/* HEADER STRIP */}
      <div className="flex justify-between items-center p-4 md:p-5 bg-[rgba(194,98,74,0.06)] border-b border-[rgba(194,98,74,0.12)]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-terracotta" />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-terracotta">
            SPARK
          </span>
        </div>
        <span className="text-[10px] px-2 py-1 rounded border border-[#3D2820] text-stone-500">
          {type}
        </span>
      </div>

      {/* BODY */}
      <div className="p-4 md:p-5">
        <div className="text-xs text-stone-500 mb-2">
          {source} · {readTime}
        </div>
        <h2 className="font-serif text-xl md:text-2xl font-medium text-stone-100 leading-snug mb-3">
          {title}
        </h2>
        <button
          onClick={onReadFullPiece}
          className="text-terracotta text-sm font-medium cursor-pointer hover:opacity-75 transition-opacity"
        >
          Read the full piece →
        </button>
      </div>

      {/* HOOK STRIP */}
      <div className="p-4 bg-[rgba(194,98,74,0.05)] border-t border-[rgba(194,98,74,0.1)]">
        <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-terracotta opacity-70 mb-1">
          WHY THIS MATTERS TODAY
        </div>
        <p className="font-serif italic text-sm text-stone-400 leading-relaxed">
          {hookText}
        </p>
      </div>
    </div>
  );
};

export default SparkCard;
