export default function ConfidenceBadge({ level = 'Medium', sessionsCompleted = 0 }) {
  const getVariants = () => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'high':
        return 'bg-accent/20 text-accent border border-accent/30';
      case 'medium':
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  };

  return (
    <div 
      className={`font-mono text-xs px-3 py-1 rounded-full inline-flex items-center whitespace-nowrap transition-colors duration-500 animate-badgePulse ${getVariants()}`}
    >
      Confidence: {level} — based on {sessionsCompleted} sessions
    </div>
  );
}
