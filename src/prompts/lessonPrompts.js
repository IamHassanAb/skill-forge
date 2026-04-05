export function buildLessonPrompt(content) {
  return `You are a communication coach. Generate a concise 3-5 paragraph lesson connecting this content to the learner's development.

Content: "${content.title}" — ${content.summary}
Lesson hook: ${content.lessonHook}
Focus area: ${content.focusAreas.join(', ')}

Respond ONLY in raw JSON, no markdown, no backticks:
{ "lessonText": "...", "keyTerms": ["term1", "term2", "term3"] }`;
}
