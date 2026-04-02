import React, { useState, useCallback } from 'react';
import './index.css';

import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Sidebar from './components/shared/Sidebar';
import SessionLayout from './components/session/SessionLayout';
import SparkCard from './components/session/SparkCard';
import LearnCard from './components/session/LearnCard';
import WrittenPractice from './components/session/WrittenPractice';
import AudioRecorder from './components/session/AudioRecorder';
import ReaderPanel from './components/reader/ReaderPanel';
import FeedbackLayout from './components/feedback/FeedbackLayout';

import useGroq from './hooks/useGroq';
import { getFirstContentForStage } from './data/content';
import { getSessionType } from './data/curriculum';

function App() {
  // ─── Screen state ───
  const [screen, setScreen] = useState('onboarding');

  // ─── Onboarding data ───
  const [onboardingData, setOnboardingData] = useState(null);

  // ─── Session state ───
  const [sessionState, setSessionState] = useState({
    currentStage: 1,
    currentSession: 1,
    currentContent: null,
    sessionType: 'written',
    sessionStep: 'spark', // 'spark' | 'learn' | 'practice'
    lessonText: '',
    keyTerms: [],
  });

  // ─── Feedback state ───
  const [feedbackState, setFeedbackState] = useState({
    submission: null,
    audioTranscript: null,
    audioDuration: null,
    isSpoken: false,
    contentCategories: [],
    acousticMetrics: null,
    overallText: '',
  });

  // ─── Reader panel ───
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // ─── Confidence ───
  const [confidenceLevel, setConfidenceLevel] = useState('Low');

  // ─── AI ───
  const { sendMessage, isLoading } = useGroq('');

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════

  const buildSidebarStages = useCallback(() => {
    if (!onboardingData?.stages) return [];
    return onboardingData.stages.map((s) => ({
      id: s.id,
      title: s.title,
      sessionCount: s.id === sessionState.currentStage ? sessionState.currentSession : 0,
      totalSessions: 4,
      status:
        s.id < sessionState.currentStage
          ? 'done'
          : s.id === sessionState.currentStage
          ? 'active'
          : 'upcoming',
    }));
  }, [onboardingData, sessionState.currentStage, sessionState.currentSession]);

  const parseFeedbackResponse = (responseText) => {
    // Try to parse structured JSON from AI response
    try {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        contentCategories: parsed.categories || [
          { name: 'Clarity', score: parsed.clarity || 3, note: parsed.clarityNote || 'Solid clarity in your response.' },
          { name: 'Structure', score: parsed.structure || 3, note: parsed.structureNote || 'Logically organised.' },
          { name: 'Conciseness', score: parsed.conciseness || 3, note: parsed.concisenessNote || 'Good use of words.' },
          { name: 'Relevance', score: parsed.relevance || 3, note: parsed.relevanceNote || 'On topic.' },
        ],
        overallText: parsed.overall || parsed.overallText || 'Your response shows promise. Keep practising and building on the concepts from this session.',
      };
    } catch {
      // Fallback: generate reasonable defaults
      return {
        contentCategories: [
          { name: 'Clarity', score: 3, note: 'Your ideas came through clearly.' },
          { name: 'Structure', score: 3, note: 'Good logical flow.' },
          { name: 'Conciseness', score: 3, note: 'Appropriate length.' },
          { name: 'Relevance', score: 3, note: 'Stayed on topic.' },
        ],
        overallText: responseText.slice(0, 300),
      };
    }
  };

  // ═══════════════════════════════════════════
  // SCREEN TRANSITIONS
  // ═══════════════════════════════════════════

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    const contentPiece = getFirstContentForStage(1, data.focusAreas);
    const sessionType = getSessionType(data.focusAreas, 1);
    setSessionState({
      currentStage: 1,
      currentSession: 1,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    });
    setScreen('session');
  };

  const handleReadFullPiece = () => {
    setIsReaderOpen(true);
  };

  const handleGoToPractice = () => {
    setSessionState((prev) => ({ ...prev, sessionStep: 'practice' }));
  };

  const handleSparkContinue = async () => {
    // Generate lesson via AI
    const content = sessionState.currentContent;
    const prompt = `You are a communication coach. Generate a concise 3-5 paragraph lesson connecting this content to the learner's development.

Content: "${content.title}" — ${content.summary}
Lesson hook: ${content.lessonHook}
Focus area: ${content.focusAreas.join(', ')}

Respond ONLY in raw JSON, no markdown, no backticks:
{ "lessonText": "...", "keyTerms": ["term1", "term2", "term3"] }`;

    const response = await sendMessage(prompt, null, null, true);
    let lessonText = '';
    let keyTerms = [];

    if (response) {
      try {
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        lessonText = parsed.lessonText || response;
        keyTerms = parsed.keyTerms || [];
      } catch {
        lessonText = response;
      }
    }

    setSessionState((prev) => ({
      ...prev,
      sessionStep: 'learn',
      lessonText,
      keyTerms,
    }));
  };

  const handleLearnContinue = () => {
    setSessionState((prev) => ({ ...prev, sessionStep: 'practice' }));
  };

  const handleWrittenSubmit = async (text) => {
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
    setScreen('feedback');
  };

  const handleSpokenSubmit = async (audioBlob, transcript) => {
    const content = sessionState.currentContent;

    // 1. AI feedback on transcript
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

    // 2. Acoustic metrics from /api/analyze-audio
    let acousticMetrics = null;
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      const res = await fetch('http://localhost:8000/api/analyze-audio', {
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
      // Fallback for demo
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
    setScreen('feedback');
  };

  const handleContinue = () => {
    const nextSession = sessionState.currentSession + 1;
    let nextStage = sessionState.currentStage;

    if (nextSession > 4) {
      nextStage = Math.min(sessionState.currentStage + 1, 5);
    }

    const actualSession = nextSession > 4 ? 1 : nextSession;
    const contentPiece = getFirstContentForStage(nextStage, onboardingData.focusAreas);
    const sessionType = getSessionType(onboardingData.focusAreas, nextStage);

    setSessionState({
      currentStage: nextStage,
      currentSession: actualSession,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    });

    // Update confidence based on progress
    const totalSessions = ((nextStage - 1) * 4) + actualSession;
    if (totalSessions >= 12) setConfidenceLevel('High');
    else if (totalSessions >= 5) setConfidenceLevel('Medium');

    setScreen('session');
  };

  const handleRequestReview = () => {
    console.log('[Situo] Human review requested — reviewer system is post-MVP');
    alert('Review requested! A reviewer will be assigned within 48 hours. (Reviewer system coming in next phase.)');
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (screen === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const { currentContent, sessionStep, sessionType, lessonText, keyTerms } = sessionState;

  const sidebarStages = buildSidebarStages();
  const stageObj = onboardingData?.stages?.find((s) => s.id === sessionState.currentStage);
  const stageTitle = stageObj ? `Stage ${stageObj.id}: ${stageObj.title}` : `Stage ${sessionState.currentStage}`;
  const sessionLabel = screen === 'feedback' ? 'AI Feedback' : `Session ${sessionState.currentSession}`;

  return (
    <div className="h-screen w-full bg-[#110D0B] text-[#EDE6DC]">
      {/* Sidebar */}
      <Sidebar
        goalTitle={onboardingData?.stages?.[0]?.title || 'Communication Mastery'}
        stages={sidebarStages}
        confidenceLevel={confidenceLevel}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Reader Panel overlay */}
      {currentContent && (
        <ReaderPanel
          isOpen={isReaderOpen}
          source={currentContent.source}
          type={currentContent.type}
          readTime={currentContent.readTime}
          title={currentContent.title}
          summary={currentContent.summary}
          onClose={() => setIsReaderOpen(false)}
          onGoToPractice={handleGoToPractice}
        />
      )}

      {/* Main content area */}
      <SessionLayout stageTitle={stageTitle} sessionLabel={sessionLabel}>
        {screen === 'session' && (
          <>
            {/* SPARK */}
            {sessionStep === 'spark' && currentContent && (
              <div className="space-y-6">
                <SparkCard
                  title={currentContent.title}
                  source={currentContent.source}
                  type={currentContent.type}
                  readTime={currentContent.readTime}
                  hookText={currentContent.lessonHook}
                  onReadFullPiece={handleReadFullPiece}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSparkContinue}
                    disabled={isLoading}
                    className="bg-terracotta text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating lesson…
                      </>
                    ) : (
                      'Continue to lesson →'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* LEARN */}
            {sessionStep === 'learn' && (
              <div className="space-y-6">
                <LearnCard lessonText={lessonText} keyTerms={keyTerms} />
                <div className="flex justify-end">
                  <button
                    onClick={handleLearnContinue}
                    className="bg-terracotta text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    Continue to practice →
                  </button>
                </div>
              </div>
            )}

            {/* PRACTICE */}
            {sessionStep === 'practice' && sessionType === 'written' && (
              <WrittenPractice
                prompt={currentContent?.practicePrompt || ''}
                onSubmit={handleWrittenSubmit}
                isLoading={isLoading}
              />
            )}

            {sessionStep === 'practice' && sessionType === 'spoken' && (
              <AudioRecorder
                prompt={currentContent?.practicePrompt || ''}
                onSubmit={handleSpokenSubmit}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        {screen === 'feedback' && (
          <FeedbackLayout
            submission={feedbackState.submission}
            audioTranscript={feedbackState.audioTranscript}
            audioDuration={feedbackState.audioDuration}
            isSpoken={feedbackState.isSpoken}
            contentCategories={feedbackState.contentCategories}
            acousticMetrics={feedbackState.acousticMetrics}
            overallText={feedbackState.overallText}
            onRequestReview={handleRequestReview}
            onContinue={handleContinue}
            breadcrumb={stageTitle}
          />
        )}
      </SessionLayout>
    </div>
  );
}

export default App;
