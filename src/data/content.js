// ─── Situo Content Library ───
// Founder-curated content pieces (~30 planned, 5 placeholders for MVP).
// Each piece maps to focus areas and a study plan stage.
// contentLevel is INTERNAL ONLY — never display it to users.
// summary is the 150-word readable text shown in the ReaderPanel.
// url is reference only — content is NOT fetched from the URL.

const content = [
  {
    id: 'content_001',
    title: 'Why the Best Communicators Use Strategic Silence',
    type: 'article',
    source: 'Harvard Business Review',
    url: 'https://hbr.org/placeholder',
    summary:
      'Great communicators know that what you don\'t say matters as much as what you do. Strategic silence — the deliberate use of pauses and restraint — is one of the most underrated tools in public speaking and interpersonal communication. This piece explores how leaders use silence to create emphasis, invite reflection, and signal confidence. The author argues that rushing to fill every gap is a nervous habit, not a sign of competence. In high-stakes conversations, a well-placed pause can shift the entire dynamic of a room. The article draws on research from cognitive psychology and real-world examples from courtroom lawyers, hostage negotiators, and TED speakers. The takeaway is clear: silence is not the absence of communication — it is communication at its most powerful.',
    focusAreas: ['clarity_conciseness', 'handling_nervousness'],
    contentLevel: 'beginner',
    stage: 1,
    lessonHook:
      'Notice how the author frames silence as a tool, not a void — that is exactly the shift we are working on in Stage 1.',
    practicePrompt:
      'Think of a time you felt rushed to speak. What would have changed if you had let a moment of silence land first?',
    sessionType: 'written',
  },
  {
    id: 'content_002',
    title: 'The Invisible Architecture of a Great Story',
    type: 'article',
    source: 'TED Ideas',
    url: 'https://ideas.ted.com/placeholder',
    summary:
      'Every memorable story follows an invisible architecture — a structure so natural that the listener never notices it. This piece breaks down the three-act framework used by the best TED speakers and explains why it works at a neurological level. The brain craves pattern and resolution: a setup that creates tension, a turning point that reframes the stakes, and a resolution that delivers meaning. The author argues that storytelling in professional contexts is not about being dramatic — it is about being intentional. When you structure your ideas as a narrative, you give your audience a reason to care. The article includes practical exercises for identifying the "turning point" in any workplace anecdote and transforming flat summaries into compelling micro-stories.',
    focusAreas: ['storytelling'],
    contentLevel: 'beginner',
    stage: 1,
    lessonHook:
      'Pay attention to how the author structures the argument itself as a story — that is the technique in action.',
    practicePrompt:
      'Tell the story of a small moment this week that taught you something. Include a beginning, a turning point, and what you took away.',
    sessionType: 'written',
  },
  {
    id: 'content_003',
    title: 'How to Listen So People Feel Heard',
    type: 'podcast',
    source: 'Hidden Brain (NPR)',
    url: 'https://hiddenbrain.org/placeholder',
    summary:
      'Most people listen to respond, not to understand. This podcast episode explores the neuroscience behind active listening — why it is cognitively demanding, what happens in the brain when someone feels truly heard, and how reflective listening techniques can transform both personal and professional relationships. The host interviews researchers who study conversational dynamics and reveals that the best listeners are not passive — they are deeply engaged, asking questions that show they are tracking the speaker\'s meaning, not just their words. The episode includes a practical framework: pause before responding, reflect back what you heard, then ask a question that goes deeper. The research suggests that feeling heard activates the same neural pathways as feeling physically safe.',
    focusAreas: ['active_listening'],
    contentLevel: 'beginner',
    stage: 1,
    lessonHook:
      'The host models active listening in the interview itself — notice the follow-up questions.',
    practicePrompt:
      'Think of a conversation where you felt unheard. What would the other person have done differently if they were practising active listening?',
    sessionType: 'written',
  },
  {
    id: 'content_004',
    title: 'Finding Your Voice: Tone and Delivery',
    type: 'video',
    source: 'Julian Treasure (TED)',
    url: 'https://ted.com/talks/placeholder',
    summary:
      'Your voice carries more emotional information than your words do. This TED talk breaks down the mechanics of vocal delivery — pitch, pace, volume, and timbre — and shows how small adjustments in tone can fundamentally change how your message lands. The speaker demonstrates vocal warm-ups, explains the difference between sonorous and breathy delivery, and makes the case that vocal variety is a learnable skill, not an innate talent. The core message is simple but powerful: how you sound determines whether people lean in or tune out. The talk includes live demonstrations where the same sentence is delivered in multiple ways, each conveying a completely different emotion. The audience reaction makes the point more effectively than any data could.',
    focusAreas: ['tone_vocal_variety'],
    contentLevel: 'beginner',
    stage: 1,
    lessonHook:
      'Listen to how the speaker shifts tone and pace throughout — it is a masterclass in what he teaches.',
    practicePrompt:
      'Record yourself reading this sentence aloud three times: "I believe this is the right direction." Each time, change your emphasis to convey a different emotion — certainty, doubt, and excitement.',
    sessionType: 'spoken',
  },
  {
    id: 'content_005',
    title: 'Speaking Through Fear: Managing Nervousness',
    type: 'article',
    source: 'Psychology Today',
    url: 'https://psychologytoday.com/placeholder',
    summary:
      'Nervousness before speaking is not a flaw — it is a signal that what you are about to say matters to you. This article explores the physiology of stage fright, reframing anxiety as excitement, and practical grounding techniques used by performers and public speakers. The author argues that the goal is not to eliminate nervousness but to channel it. Breathing exercises, power poses, and cognitive reframing are presented as tools — not shortcuts. The emphasis is on building comfort with discomfort over time. The most striking insight in the piece: the audience rarely perceives the level of nervousness the speaker feels internally. Your fear is louder to you than it is to them. That gap between feeling and appearance is where confidence begins to grow.',
    focusAreas: ['handling_nervousness'],
    contentLevel: 'beginner',
    stage: 1,
    lessonHook:
      'The author reframes nervousness as energy — not an enemy to defeat, but a resource to channel.',
    practicePrompt:
      'Describe your physical experience of nervousness before speaking. What does it feel like in your body, and what do you typically do in response?',
    sessionType: 'spoken',
  },
];

export default content;

/**
 * Get all content matching a stage and at least one focus area.
 */
export const getContentForStageAndFocus = (stage, focusAreas) => {
  return content.filter(
    (c) =>
      c.stage === stage &&
      c.focusAreas.some((fa) => focusAreas.includes(fa))
  );
};

/**
 * Get the first content piece for a stage + focus area combo.
 * Falls back to any content in that stage, then the first item overall.
 */
export const getFirstContentForStage = (stage, focusAreas) => {
  const matches = getContentForStageAndFocus(stage, focusAreas);
  return matches.length > 0
    ? matches[0]
    : content.find((c) => c.stage === stage) || content[0];
};
