import { useState } from 'react';

export default function Sidebar({ 
  stages = [], 
  activeStage = null, 
  userGoal = "Learn Photography Basics", 
  onGoalChange 
}) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(userGoal);

  const handleGoalSave = () => {
    if (onGoalChange) onGoalChange(goalInput);
    setIsEditingGoal(false);
  };

  return (
    <div className="w-72 flex-shrink-0 bg-[#111111] border-r border-zinc-800 p-4 flex flex-col gap-6 overflow-y-auto h-full">
      
      {/* Study Plan Section */}
      <div className="flex-1">
        <h2 className="text-zinc-500 text-xs uppercase tracking-widest font-mono mb-3">
          Study Plan
        </h2>
        
        {stages.length === 0 ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse pl-3 border-l-2 border-transparent flex flex-col gap-2">
                <div className="h-4 bg-zinc-800 rounded w-full line-clamp-1"></div>
                <div className="h-3 bg-zinc-900 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {stages.map((stage, index) => {
              const isActive = activeStage === stage.id;
              return (
                <div 
                  key={stage.id} 
                  className={`pl-3 border-l-2 transition-colors ${
                    isActive 
                      ? 'border-accent text-accent' 
                      : 'border-transparent text-zinc-500'
                  }`}
                  style={isActive ? { filter: "drop-shadow(0 0 6px #c8f135)" } : {}}
                >
                  <div className="font-mono text-sm font-semibold mb-1">
                    {index + 1}. {stage.title}
                  </div>
                  {stage.description && (
                    <div className="text-xs font-sans opacity-80 leading-relaxed">
                      {stage.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Your Goal Section */}
      <div className="pt-6 border-t border-zinc-800 shrink-0">
        <h2 className="text-zinc-500 text-xs uppercase tracking-widest font-mono mb-3">
          Your Goal
        </h2>

        {isEditingGoal ? (
          <div className="flex flex-col gap-2">
            <input 
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
              className="w-full bg-zinc-900 border border-zinc-700 text-white font-mono text-sm p-2 rounded focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditingGoal(false)}
                className="text-zinc-500 text-xs font-mono hover:text-white px-2 py-1 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGoalSave}
                className="bg-accent text-black text-xs font-mono font-bold px-3 py-1.5 rounded hover:brightness-110 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="group flex items-start justify-between gap-3">
            <div className="text-white font-mono text-sm leading-relaxed">
              {userGoal}
            </div>
            <button 
              onClick={() => {
                setGoalInput(userGoal);
                setIsEditingGoal(true);
              }}
              className="opacity-50 hover:opacity-100 hover:scale-110 transition-all shrink-0 mt-0.5 cursor-pointer"
              title="Edit Goal"
              aria-label="Edit Goal"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
