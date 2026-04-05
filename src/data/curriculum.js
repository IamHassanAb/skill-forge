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
import { SPOKEN_CANONICAL_KEYS } from './focusAreaMap';

/**
 * Determine session type based on focus areas.
 * Mixed focus areas alternate by stage number.
 */
export const getSessionType = (focusAreas, stageNumber) => {
  const hasSpoken = focusAreas.some((fa) => SPOKEN_CANONICAL_KEYS.includes(fa));
  const hasWritten = focusAreas.some((fa) => !SPOKEN_CANONICAL_KEYS.includes(fa));

  if (hasSpoken && hasWritten) {
    return stageNumber % 2 === 0 ? 'spoken' : 'written';
  }

  if (hasSpoken) return 'spoken';
  return 'written';
};
