import { useState } from 'react';
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
import useSession from './hooks/useSession';
import useFeedback from './hooks/useFeedback';

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
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
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
