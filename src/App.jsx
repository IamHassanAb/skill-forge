import { useState, lazy, Suspense } from 'react';
import './index.css';

const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow'));
const ReaderPanel = lazy(() => import('./components/reader/ReaderPanel'));
const FeedbackLayout = lazy(() => import('./components/feedback/FeedbackLayout'));

import Sidebar from './components/shared/Sidebar';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SessionLayout from './components/session/SessionLayout';
import SparkCard from './components/session/SparkCard';
import LearnCard from './components/session/LearnCard';
import WrittenPractice from './components/session/WrittenPractice';
import AudioRecorder from './components/session/AudioRecorder';

import useGroq from './hooks/useGroq';
import useSession from './hooks/useSession';
import useFeedback from './hooks/useFeedback';
import Bomb from './components/shared/Bomb';

function App() {
  // ─── Screen state ───
  const [screen, setScreen] = useState('onboarding');

  // ─── Onboarding data ───
  const [onboardingData, setOnboardingData] = useState(null);

  // ─── Reader panel ───
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // ─── Confidence ───
  const [confidenceLevel, setConfidenceLevel] = useState('Low');

  // ─── AI ───
  const { sendMessage, isLoading } = useGroq('');

  // ─── Session hook ───
  const {
    sessionState,
    initSession,
    handleGoToPractice,
    handleSparkContinue,
    handleLearnContinue,
    handleContinue: handleContinueSession,
    buildSidebarStages,
  } = useSession({ sendMessage, onboardingData });

  // ─── Feedback hook ───
  const {
    feedbackState,
    handleWrittenSubmit: submitWritten,
    handleSpokenSubmit: submitSpoken,
    handleRequestReview,
  } = useFeedback({ sendMessage, sessionState });

  // ═══════════════════════════════════════════
  // SCREEN TRANSITIONS
  // ═══════════════════════════════════════════

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    initSession(data);
    setScreen('session');
  };

  const handleReadFullPiece = () => {
    setIsReaderOpen(true);
  };

  const handleWrittenSubmit = async (text) => {
    await submitWritten(text);
    setScreen('feedback');
  };

  const handleSpokenSubmit = async (audioBlob, transcript) => {
    await submitSpoken(audioBlob, transcript);
    setScreen('feedback');
  };

  const handleContinue = () => {
    handleContinueSession();

    // Update confidence based on progress
    const nextSession = sessionState.currentSession + 1;
    const nextStage = nextSession > 4 ? Math.min(sessionState.currentStage + 1, 5) : sessionState.currentStage;
    const actualSession = nextSession > 4 ? 1 : nextSession;
    const totalSessions = ((nextStage - 1) * 4) + actualSession;
    if (totalSessions >= 12) setConfidenceLevel('High');
    else if (totalSessions >= 5) setConfidenceLevel('Medium');

    setScreen('session');
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (screen === 'onboarding') {
    return (
      <ErrorBoundary>

        <>
          <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </Suspense>

        </>
      </ErrorBoundary>
    );
  }

  const { currentContent, sessionStep, sessionType, lessonText, keyTerms } = sessionState;

  const sidebarStages = buildSidebarStages();
  const stageObj = onboardingData?.stages?.find((s) => s.id === sessionState.currentStage);
  const stageTitle = stageObj ? `Stage ${stageObj.id}: ${stageObj.title}` : `Stage ${sessionState.currentStage}`;
  const sessionLabel = screen === 'feedback' ? 'AI Feedback' : `Session ${sessionState.currentSession}`;

  return (
    <div className="h-screen w-full bg-[var(--bg)] text-[var(--t1)]">
      {/* Sidebar */}
      <Sidebar
        goalTitle={onboardingData?.stages?.[0]?.title || 'Communication Mastery'}
        stages={sidebarStages}
        confidenceLevel={confidenceLevel}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Reader Panel overlay */}
      {currentContent && (
        <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
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
        </Suspense>
      )}

      {/* Main content area */}
      <SessionLayout stageTitle={stageTitle} sessionLabel={sessionLabel}>
        {screen === 'session' && (
          <ErrorBoundary>
            {/* <Bomb /> */}
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
                          <div role="status" aria-live="polite" className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          </ErrorBoundary>
        )}

        {screen === 'feedback' && (
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
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
            </Suspense>
          </ErrorBoundary>
        )}
      </SessionLayout>
    </div>
  );
}

export default App;
