import { useCallback } from 'react';
import { getSessionType } from '../data/curriculum';
import useContent from './useContent';
import parseGroqJSON from '../utils/parseGroqJSON';
import { buildLessonPrompt } from '../prompts/lessonPrompts';

const useSession = ({ sendMessage, onboardingData, sessionState, dispatch }) => {
  const { getNextContent, markAsSeen, resetSeen } = useContent();

  const initSession = useCallback((data) => {
    resetSeen();
    const sessionType = getSessionType(data.focusAreas, 1);
    const contentPiece = getNextContent(1, data.focusAreas, sessionType);
    dispatch({ type: 'UPDATE_SESSION', payload: {
      currentStage: 1,
      currentSession: 1,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    }});
  }, [dispatch, getNextContent, resetSeen]);

  const handleGoToPractice = useCallback(() => {
    dispatch({ type: 'UPDATE_SESSION', payload: { sessionStep: 'practice' } });
  }, [dispatch]);

  const handleSparkContinue = useCallback(async () => {
    const content = sessionState.currentContent;
    const prompt = buildLessonPrompt(content);
    const response = await sendMessage(prompt, null, null, true);
    let lessonText = '';
    let keyTerms = [];

    if (response) {
      const parsed = parseGroqJSON(response);
      if (parsed) {
        lessonText = parsed.lessonText || response;
        keyTerms = parsed.keyTerms || [];
      } else {
        lessonText = response;
      }
    }

    dispatch({ type: 'UPDATE_SESSION', payload: { sessionStep: 'learn', lessonText, keyTerms } });
  }, [sessionState.currentContent, sendMessage, dispatch]);

  const handleLearnContinue = useCallback(() => {
    dispatch({ type: 'UPDATE_SESSION', payload: { sessionStep: 'practice' } });
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    if (sessionState.currentContent?.id) {
      markAsSeen(sessionState.currentContent.id);
    }

    const nextSession = sessionState.currentSession + 1;
    let nextStage = sessionState.currentStage;

    if (nextSession > 4) {
      nextStage = Math.min(sessionState.currentStage + 1, 5);
    }

    const actualSession = nextSession > 4 ? 1 : nextSession;
    const sessionType = getSessionType(onboardingData.focusAreas, nextStage);
    const contentPiece = getNextContent(nextStage, onboardingData.focusAreas, sessionType);

    dispatch({ type: 'UPDATE_SESSION', payload: {
      currentStage: nextStage,
      currentSession: actualSession,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    }});
  }, [sessionState.currentSession, sessionState.currentStage, sessionState.currentContent, onboardingData, dispatch, markAsSeen, getNextContent]);

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

  return {
    initSession,
    handleGoToPractice,
    handleSparkContinue,
    handleLearnContinue,
    handleContinue,
    buildSidebarStages,
  };
};

export default useSession;
