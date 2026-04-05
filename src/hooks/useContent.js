import { useRef, useCallback } from 'react';
import { getNextUnseen } from '../data/content';

const useContent = () => {
  const seenContentIds = useRef(new Set());

  const getNextContent = useCallback((stage, canonicalKeys, targetSessionType) => {
    return getNextUnseen(stage, canonicalKeys, seenContentIds.current, targetSessionType);
  }, []);

  const markAsSeen = useCallback((contentId) => {
    seenContentIds.current.add(contentId);
  }, []);

  const resetSeen = useCallback(() => {
    seenContentIds.current = new Set();
  }, []);

  return { getNextContent, markAsSeen, resetSeen };
};

export default useContent;
