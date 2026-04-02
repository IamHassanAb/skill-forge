import React from 'react';
import ContentFeedback from './ContentFeedback';
import AcousticMetrics from './AcousticMetrics';
import DeliveryNotice from './DeliveryNotice';
import OverallCard from './OverallCard';
import FeedbackActions from './FeedbackActions';

const FeedbackLayout = ({
  submission,
  audioTranscript,
  audioDuration,
  isSpoken,
  contentCategories,
  acousticMetrics,
  overallText,
  onRequestReview,
  onContinue,
  breadcrumb,
}) => {
  return (
    <div className="pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[10px] uppercase tracking-[0.12em] text-stone-500 font-bold">
          AI FEEDBACK
        </span>
        <span className="text-stone-600 text-xs">·</span>
        <span className="text-[10px] text-stone-600">{breadcrumb}</span>
      </div>

      <div className="space-y-6">
        {/* Submission card */}
        {isSpoken ? (
          <div className="bg-[#1C1410] border border-[#2A1E16] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
                YOUR RECORDING
              </span>
              {audioDuration && (
                <span className="text-xs text-stone-500 tabular-nums">
                  {audioDuration}
                </span>
              )}
            </div>
            <p className="font-serif italic text-stone-400 text-sm leading-relaxed">
              {audioTranscript}
            </p>
          </div>
        ) : (
          <div className="bg-[#1C1410] border border-[#2A1E16] rounded-xl p-6">
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-[0.08em] text-stone-500 font-semibold">
                YOUR RESPONSE
              </span>
            </div>
            <p className="font-sans text-stone-400 text-sm leading-relaxed">
              {submission}
            </p>
          </div>
        )}

        {/* Content categories (2x2 grid) */}
        <ContentFeedback categories={contentCategories} />

        {/* Acoustic metrics — spoken only */}
        {isSpoken && acousticMetrics && (
          <AcousticMetrics
            pace={acousticMetrics.pace}
            talkTime={acousticMetrics.talkTime}
            totalTime={acousticMetrics.totalTime}
            fillerWords={acousticMetrics.fillerWords}
            pauses={acousticMetrics.pauses}
          />
        )}

        {/* Delivery notice — spoken only */}
        {isSpoken && <DeliveryNotice />}

        {/* Overall card */}
        <OverallCard text={overallText} isSpoken={isSpoken} />
      </div>

      {/* Sticky action bar */}
      <FeedbackActions
        onRequestReview={onRequestReview}
        onContinue={onContinue}
        isSpoken={isSpoken}
      />
    </div>
  );
};

export default FeedbackLayout;
