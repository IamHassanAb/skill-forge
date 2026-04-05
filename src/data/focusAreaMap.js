export const CANONICAL_FOCUS_AREAS = {
  clarity_conciseness: {
    label: 'Clarity & conciseness',
    contentTags: [
      'Clarity and Simplicity',
      'Conciseness',
      'Clarity & Precision',
      'Conciseness & Brevity',
      'Clarity',
      'Active Expression',
      'Editing Techniques',
      'Sentence Structure',
    ],
    spoken: false,
  },
  active_listening: {
    label: 'Active listening',
    contentTags: [
      'Feedback Loops',
      'Audience Centricity',
      'Audience Awareness',
      'Audience',
    ],
    spoken: false,
  },
  storytelling: {
    label: 'Storytelling',
    contentTags: [
      'Storytelling',
      'Rhetorical Devices',
      'Pattern Recognition',
      'Memorability',
    ],
    spoken: false,
  },
  handling_nervousness: {
    label: 'Handling nervousness',
    contentTags: [
      'Anxiety Management',
      'Arousal Reappraisal',
      'Confidence',
      'Preparation',
      'Performance Optimization',
      'Opportunity Mindset',
    ],
    spoken: true,
  },
  tone_vocal_variety: {
    label: 'Tone & vocal variety',
    contentTags: [
      'Vocal Delivery',
      'Voice',
      'Delivery',
    ],
    spoken: true,
  },
  emotional_intelligence: {
    label: 'Emotional intelligence',
    contentTags: ['Emotional Intelligence'],
    spoken: false,
  },
  nonverbal_communication: {
    label: 'Nonverbal communication',
    contentTags: ['Non-verbal Communication'],
    spoken: false,
  },
};

export const SPOKEN_CANONICAL_KEYS = Object.entries(CANONICAL_FOCUS_AREAS)
  .filter(([, v]) => v.spoken)
  .map(([k]) => k);

// Build reverse lookup: tag → canonical key
const _tagToCanonical = {};
for (const [key, { contentTags }] of Object.entries(CANONICAL_FOCUS_AREAS)) {
  for (const tag of contentTags) {
    _tagToCanonical[tag.toLowerCase()] = key;
  }
}

// Build reverse lookup: label → canonical key
const _labelToCanonical = {};
for (const [key, { label }] of Object.entries(CANONICAL_FOCUS_AREAS)) {
  _labelToCanonical[label.toLowerCase()] = key;
}

export function contentTagToCanonical(tag) {
  return _tagToCanonical[tag?.toLowerCase()] ?? null;
}

export function userLabelToCanonical(label) {
  return _labelToCanonical[label?.toLowerCase()] ?? null;
}
