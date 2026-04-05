export function buildLessonPrompt(content, context) {
  const contextLine = context && context !== 'Both'
    ? `Frame all examples and advice specifically for a ${context.toLowerCase()} communication setting.`
    : 'Draw on examples from both professional and social communication settings.';

  return `You are a communication coach. Generate a concise 3-5 paragraph lesson connecting this content to the learner's development.

Content: "${content.title}" — ${content.summary}
Lesson hook: ${content.lessonHook}
Focus area: ${content.focusAreas.join(', ')}
Context: ${contextLine}

Respond ONLY in raw JSON, no markdown, no backticks:
{ "lessonText": "...", "keyTerms": ["term1", "term2", "term3"] }`;
}
