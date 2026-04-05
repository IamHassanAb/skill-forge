import { useReducer, lazy, Suspense } from 'react';
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

const initialState = {
  screen: 'onboarding',
  onboardingData: null,
  session: {
    currentStage: 1,
    currentSession: 1,
    currentContent: null,
    sessionType: 'written',
    sessionStep: 'spark',
    lessonText: '',
    keyTerms: [],
  },
  feedback: {
    submission: null,
    audioTranscript: null,
    audioDuration: null,
    isSpoken: false,
    contentCategories: [],
    acousticMetrics: null,
    overallText: '',
  },
  isReaderOpen: false,
  confidenceLevel: 'Low',
};

function appReducer(state, action) {
  switch (action.type) {
    case 'ONBOARDING_COMPLETE':
      return { ...state, onboardingData: action.payload };
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'UPDATE_SESSION':
      return { ...state, session: { ...state.session, ...action.payload } };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'TOGGLE_READER':
      return { ...state, isReaderOpen: action.payload };
    case 'SET_CONFIDENCE':
      return { ...state, confidenceLevel: action.payload };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ─── AI ───
  const { sendMessage, isLoading } = useGroq('');

  // ─── Session hook ───
  const {
    initSession,
    handleGoToPractice,
    handleSparkContinue,
    handleLearnContinue,
    handleContinue: handleContinueSession,
    buildSidebarStages,
  } = useSession({ sendMessage, onboardingData: state.onboardingData, sessionState: state.session, dispatch });

  // ─── Feedback hook ───
  const {
    handleWrittenSubmit: submitWritten,
    handleSpokenSubmit: submitSpoken,
    handleRequestReview,
  } = useFeedback({ sendMessage, sessionState: state.session, dispatch });

  // ═══════════════════════════════════════════
  // SCREEN TRANSITIONS
  // ═══════════════════════════════════════════

  const handleOnboardingComplete = (data) => {
    dispatch({ type: 'ONBOARDING_COMPLETE', payload: data });
    initSession(data);
    dispatch({ type: 'SET_SCREEN', payload: 'session' });
  };

  const handleReadFullPiece = () => {
    dispatch({ type: 'TOGGLE_READER', payload: true });
  };

  const handleWrittenSubmit = async (text) => {
    await submitWritten(text);
    dispatch({ type: 'SET_SCREEN', payload: 'feedback' });
  };

  const handleSpokenSubmit = async (audioBlob, transcript) => {
    await submitSpoken(audioBlob, transcript);
    dispatch({ type: 'SET_SCREEN', payload: 'feedback' });
  };

  const handleContinue = () => {
    handleContinueSession();

    // Update confidence based on progress
    const nextSession = state.session.currentSession + 1;
    const nextStage = nextSession > 4 ? Math.min(state.session.currentStage + 1, 5) : state.session.currentStage;
    const actualSession = nextSession > 4 ? 1 : nextSession;
    const totalSessions = ((nextStage - 1) * 4) + actualSession;
    if (totalSessions >= 12) dispatch({ type: 'SET_CONFIDENCE', payload: 'High' });
    else if (totalSessions >= 5) dispatch({ type: 'SET_CONFIDENCE', payload: 'Medium' });

    dispatch({ type: 'SET_SCREEN', payload: 'session' });
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (state.screen === 'onboarding') {
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

  const { currentContent, sessionStep, sessionType, lessonText, keyTerms } = state.session;

  const sidebarStages = buildSidebarStages();
  const stageObj = state.onboardingData?.stages?.find((s) => s.id === state.session.currentStage);
  const stageTitle = stageObj ? `Stage ${stageObj.id}: ${stageObj.title}` : `Stage ${state.session.currentStage}`;
  const sessionLabel = state.screen === 'feedback' ? 'AI Feedback' : `Session ${state.session.currentSession}`;

  return (
    <div className="h-screen w-full bg-[var(--bg)] text-[var(--t1)]">
      {/* Sidebar */}
      <Sidebar
        goalTitle={state.onboardingData?.stages?.[0]?.title || 'Communication Mastery'}
        stages={sidebarStages}
        confidenceLevel={state.confidenceLevel}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Reader Panel overlay */}
      {currentContent && (
        <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
          <ReaderPanel
            isOpen={state.isReaderOpen}
            source={currentContent.source}
            type={currentContent.type}
            readTime={currentContent.readTime}
            title={currentContent.title}
            summary={currentContent.summary}
            onClose={() => dispatch({ type: 'TOGGLE_READER', payload: false })}
            onGoToPractice={handleGoToPractice}
          />
        </Suspense>
      )}

      {/* Main content area */}
      <SessionLayout stageTitle={stageTitle} sessionLabel={sessionLabel}>
        {state.screen === 'session' && (
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

        {state.screen === 'feedback' && (
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
              <FeedbackLayout
                submission={state.feedback.submission}
                audioTranscript={state.feedback.audioTranscript}
                audioDuration={state.feedback.audioDuration}
                isSpoken={state.feedback.isSpoken}
                contentCategories={state.feedback.contentCategories}
                acousticMetrics={state.feedback.acousticMetrics}
                overallText={state.feedback.overallText}
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
