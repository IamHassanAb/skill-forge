export function getConfidence(sessionsCompleted) {
  if (sessionsCompleted >= 4) return 'High';
  if (sessionsCompleted >= 2) return 'Medium';
  return 'Low';
}
