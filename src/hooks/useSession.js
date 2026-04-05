import { useCallback } from 'react';
import { getFirstContentForStage } from '../data/content';
import { getSessionType } from '../data/curriculum';
import parseGroqJSON from '../utils/parseGroqJSON';
import { buildLessonPrompt } from '../prompts/lessonPrompts';

const useSession = ({ sendMessage, onboardingData, sessionState, dispatch }) => {
  const initSession = useCallback((data) => {
    const contentPiece = getFirstContentForStage(1, data.focusAreas);
    const sessionType = getSessionType(data.focusAreas, 1);
    dispatch({ type: 'UPDATE_SESSION', payload: {
      currentStage: 1,
      currentSession: 1,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    }});
  }, [dispatch]);

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
    const nextSession = sessionState.currentSession + 1;
    let nextStage = sessionState.currentStage;

    if (nextSession > 4) {
      nextStage = Math.min(sessionState.currentStage + 1, 5);
    }

    const actualSession = nextSession > 4 ? 1 : nextSession;
    const contentPiece = getFirstContentForStage(nextStage, onboardingData.focusAreas);
    const sessionType = getSessionType(onboardingData.focusAreas, nextStage);

    dispatch({ type: 'UPDATE_SESSION', payload: {
      currentStage: nextStage,
      currentSession: actualSession,
      currentContent: contentPiece,
      sessionType,
      sessionStep: 'spark',
      lessonText: '',
      keyTerms: [],
    }});
  }, [sessionState.currentSession, sessionState.currentStage, onboardingData, dispatch]);

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
