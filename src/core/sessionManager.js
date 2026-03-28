import { useState } from 'react';

export function useSessionManager() {
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSessionActive, setCurrentSessionActive] = useState(false);
  const [userGoal, setUserGoal] = useState("Complete all 5 stages");

  const startSession = () => {
    setCurrentSessionActive(true);
  };

  const completeSession = () => {
    setSessionsCompleted(prev => prev + 1);
    setCurrentSessionActive(false);
  };

  const adjustGoal = (newGoal) => {
    setUserGoal(newGoal);
    // Note: Do NOT reset sessions_completed or break active session flow.
    // The next dynamically generated lesson should just naturally adapt to the new goal.
  };

  return {
    sessionsCompleted,
    currentSessionActive,
    userGoal,
    startSession,
    completeSession,
    adjustGoal
  };
}
