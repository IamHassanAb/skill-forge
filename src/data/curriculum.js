// ─── Situo Curriculum Structure ───
// Default 5-stage study plan. These titles are shown
// on the completion screen and sidebar. The AI may
// generate customized titles during onboarding —
// these serve as fallbacks.

export const defaultStages = [
  { id: 1, title: 'Finding your authentic voice' },
  { id: 2, title: 'Structure and clarity in speech' },
  { id: 3, title: 'Narrative and storytelling technique' },
  { id: 4, title: 'Listening and reading the room' },
  { id: 5, title: 'High-stakes moments and presence' },
];

// ─── Focus area → session type mapping ───
// Per SRS: tone_vocal_variety and handling_nervousness → spoken
// All other focus areas → written

const SPOKEN_FOCUS_AREAS = ['tone_vocal_variety', 'handling_nervousness'];

/**
 * Determine session type based on focus areas.
 * Mixed focus areas alternate by stage number.
 */
export const getSessionType = (focusAreas, stageNumber) => {
  const hasSpoken = focusAreas.some((fa) => SPOKEN_FOCUS_AREAS.includes(fa));
  const hasWritten = focusAreas.some((fa) => !SPOKEN_FOCUS_AREAS.includes(fa));

  if (hasSpoken && hasWritten) {
    return stageNumber % 2 === 0 ? 'spoken' : 'written';
  }

  if (hasSpoken) return 'spoken';
  return 'written';
};
