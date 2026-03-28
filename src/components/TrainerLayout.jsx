import ConfidenceBadge from './ConfidenceBadge';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';

export default function TrainerLayout({
  sessionsCompleted,
  confidenceLevel,
  userGoal,
  stages,
  activeStage,
  messages,
  isLoading,
  onSend,
  onGoalChange
}) {
  return (
    <div className="w-full h-screen bg-[#0d0d0d] flex flex-col text-white overflow-hidden animate-fadeIn relative z-10">
      {/* Top Bar */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-[#0d0d0d]">
        <div className="flex items-center">
          <span className="font-mono font-bold text-accent text-lg">SkillForge</span>
          <span className="text-zinc-500 text-sm ml-3">📷 Photography</span>
        </div>
        <div>
          <ConfidenceBadge key={confidenceLevel} level={confidenceLevel} sessionsCompleted={sessionsCompleted} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left: Sidebar */}
        <Sidebar 
          stages={stages} 
          activeStage={activeStage}
          userGoal={userGoal} 
          onGoalChange={onGoalChange} 
        />
        
        {/* Right: Chat Panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChatPanel 
            messages={messages} 
            onSend={onSend} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      {/* Subtle Scanline Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50"
        style={{ 
          background: "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)" 
        }} 
      />
    </div>
  );
}
