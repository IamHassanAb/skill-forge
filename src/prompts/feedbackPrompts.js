export function buildWrittenFeedbackPrompt(practicePrompt, userResponse) {
  return `You are an AI communication coach. Evaluate this practice response for clarity, structure, conciseness, and relevance.

Practice prompt: "${practicePrompt}"
User response: "${userResponse}"

Respond ONLY in raw JSON:
{
  "categories": [
    { "name": "Clarity", "score": 1-5, "note": "..." },
    { "name": "Structure", "score": 1-5, "note": "..." },
    { "name": "Conciseness", "score": 1-5, "note": "..." },
    { "name": "Relevance", "score": 1-5, "note": "..." }
  ],
  "overallText": "..."
}`;
}

export function buildSpokenFeedbackPrompt(practicePrompt, transcript) {
  return `You are an AI communication coach. Evaluate this spoken response transcript for clarity, structure, conciseness, and relevance. Explicitly flag all delivery elements (tone, pace, nervousness, presence) as requiring human review.

Practice prompt: "${practicePrompt}"
User transcript: "${transcript}"

Respond ONLY in raw JSON:
{
  "categories": [
    { "name": "Clarity", "score": 1-5, "note": "..." },
    { "name": "Structure", "score": 1-5, "note": "..." },
    { "name": "Conciseness", "score": 1-5, "note": "..." },
    { "name": "Relevance", "score": 1-5, "note": "..." }
  ],
  "overallText": "..."
}`;
}
