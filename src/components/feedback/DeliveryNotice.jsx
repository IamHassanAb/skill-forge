import { memo } from 'react';

const DELIVERY_ITEMS = [
  'Tone and vocal variety',
  'Pace and use of pausing',
  'Confidence and presence',
  'Nervousness signals',
];

const DeliveryNotice = memo(function DeliveryNotice() {
  return (
    <div className="bg-[#C9912A]/5 border border-[#C9912A]/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9912A]" />
        <span className="font-serif italic font-bold text-[#C9912A] text-sm">
          Delivery requires a human ear
        </span>
      </div>

      {/* Body */}
      <p className="text-[var(--t3)] text-sm leading-relaxed mb-4">
        AI assessed your words from the transcript. These elements can only be heard — not read:
      </p>

      {/* Items */}
      <div className="space-y-2">
        {DELIVERY_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-[var(--t3)]">
            <span className="text-[#C9912A]/60 text-xs">○</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DeliveryNotice;
