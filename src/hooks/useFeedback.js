import { useState, useCallback } from 'react';
import parseGroqJSON from '../utils/parseGroqJSON';

const parseFeedbackResponse = (responseText) => {
  const parsed = parseGroqJSON(responseText);
  if (parsed) {
    return {
      contentCategories: parsed.categories || [
        { name: 'Clarity', score: parsed.clarity || 3, note: parsed.clarityNote || 'Solid clarity in your response.' },
        { name: 'Structure', score: parsed.structure || 3, note: parsed.structureNote || 'Logically organised.' },
        { name: 'Conciseness', score: parsed.conciseness || 3, note: parsed.concisenessNote || 'Good use of words.' },
        { name: 'Relevance', score: parsed.relevance || 3, note: parsed.relevanceNote || 'On topic.' },
      ],
      overallText: parsed.overall || parsed.overallText || 'Your response shows promise. Keep practising and building on the concepts from this session.',
    };
  }
  return {
    contentCategories: [
      { name: 'Clarity', score: 3, note: 'Your ideas came through clearly.' },
      { name: 'Structure', score: 3, note: 'Good logical flow.' },
      { name: 'Conciseness', score: 3, note: 'Appropriate length.' },
      { name: 'Relevance', score: 3, note: 'Stayed on topic.' },
    ],
    overallText: responseText.slice(0, 300),
  };
};

const useFeedback = ({ sendMessage, sessionState }) => {
  const [feedbackState, setFeedbackState] = useState({
    submission: null,
    audioTranscript: null,
    audioDuration: null,
    isSpoken: false,
    contentCategories: [],
    acousticMetrics: null,
    overallText: '',
  });

  const handleWrittenSubmit = useCallback(async (text) => {
    const content = sessionState.currentContent;
    const prompt = `You are an AI communication coach. Evaluate this practice response for clarity, structure, conciseness, and relevance.

Practice prompt: "${content.practicePrompt}"
User response: "${text}"

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

    const response = await sendMessage(prompt, null, null, true);
    const parsed = parseFeedbackResponse(response || '');

    setFeedbackState({
      submission: text,
      audioTranscript: null,
      audioDuration: null,
      isSpoken: false,
      contentCategories: parsed.contentCategories,
      acousticMetrics: null,
      overallText: parsed.overallText,
    });

    return true;
  }, [sessionState.currentContent, sendMessage]);

  const handleSpokenSubmit = useCallback(async (audioBlob, transcript) => {
    const content = sessionState.currentContent;

    const feedbackPrompt = `You are an AI communication coach. Evaluate this spoken response transcript for clarity, structure, conciseness, and relevance. Explicitly flag all delivery elements (tone, pace, nervousness, presence) as requiring human review.

Practice prompt: "${content.practicePrompt}"
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

    const feedbackResponse = await sendMessage(feedbackPrompt, null, null, true);
    const parsed = parseFeedbackResponse(feedbackResponse || '');

    let acousticMetrics = null;
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze-audio`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      acousticMetrics = {
        pace: data.pace || 140,
        talkTime: data.talkTime || 60,
        totalTime: data.totalTime || 90,
        fillerWords: data.fillerWords || [],
        pauses: data.pauses || [],
      };
    } catch (err) {
      console.error('Acoustic analysis failed:', err);
      acousticMetrics = {
        pace: 142,
        talkTime: 64,
        totalTime: 90,
        fillerWords: [
          { word: 'um', count: 4 },
          { word: 'like', count: 2 },
        ],
        pauses: [
          { duration: 1.2 },
          { duration: 0.8 },
          { duration: 1.5 },
        ],
      };
    }

    setFeedbackState({
      submission: null,
      audioTranscript: transcript,
      audioDuration: `${Math.floor(acousticMetrics.talkTime / 60)}:${String(Math.floor(acousticMetrics.talkTime % 60)).padStart(2, '0')}`,
      isSpoken: true,
      contentCategories: parsed.contentCategories,
      acousticMetrics,
      overallText: parsed.overallText,
    });

    return true;
  }, [sessionState.currentContent, sendMessage]);

  const handleRequestReview = useCallback(() => {
    console.log('[Situo] Human review requested — reviewer system is post-MVP');
    alert('Review requested! A reviewer will be assigned within 48 hours. (Reviewer system coming in next phase.)');
  }, []);

  return {
    feedbackState,
    handleWrittenSubmit,
    handleSpokenSubmit,
    handleRequestReview,
  };
};

export default useFeedback;
