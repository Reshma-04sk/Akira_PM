import React from "react";

interface InteractiveKanbanProps {
  scroll: number; // Stateful damped scroll value (0.0 -> 1.0)
}

export const InteractiveKanban: React.FC<InteractiveKanbanProps> = ({ scroll }) => {
  // Staggered column assembly offsets
  // Column 1 emerges at scroll 0.50, Column 2 at 0.53, etc.
  const getColumnProps = (index: number) => {
    const trigger = 0.50 + index * 0.04;
    const progress = Math.max(0, Math.min((scroll - trigger) / 0.12, 1.0));
    const eased = 1 - Math.pow(1 - progress, 3); // cubic-bezier lookalike

    return {
      opacity: eased,
      transform: `translateY(${(1 - eased) * 45}px) translateZ(${eased * 12}px)`,
    };
  };

  // Card Move Moment Choreography:
  // "AI Sprint Planning" moves from IN PROGRESS column to REVIEW column
  // Triggers between scroll 0.72 and 0.86
  const getMovingCardStyle = () => {
    const startTrigger = 0.72;
    const endTrigger = 0.86;
    const progress = Math.max(0, Math.min((scroll - startTrigger) / (endTrigger - startTrigger), 1.0));
    const eased = 1 - Math.pow(1 - progress, 3); // Easing

    // Width of column is ~220px, gap is 16px. Moving left-to-right (from In Progress [index 2] to Review [index 3])
    // Translate x roughly 236px across, and adjust y position based on slot layout.
    const xTranslation = eased * 236;
    const yTranslation = eased * 60; // moves down to lower card slot

    return {
      transform: `translateX(${xTranslation}px) translateY(${yTranslation}px) translateZ(${18 + eased * 8}px)`,
      borderColor: progress > 0 && progress < 1 ? "rgba(203, 163, 88, 0.4)" : "rgba(255, 255, 255, 0.05)",
      boxShadow: progress > 0 && progress < 1 ? "0 4px 20px rgba(203, 163, 88, 0.12)" : "none",
    };
  };

  // AI Moment:
  // "Generate sprint backlog" typed action. Triggers between scroll 0.80 and 0.92
  const getAiState = () => {
    if (scroll < 0.80) {
      return { status: "idle", text: "Generate sprint backlog" };
    }
    if (scroll < 0.88) {
      return { status: "typing", text: "Analyzing roadmap..." };
    }
    return { status: "completed", text: "6 tasks generated" };
  };

  const ai = getAiState();

  // AI Generated tasks opacity
  const getGeneratedTasksOpacity = () => {
    const progress = Math.max(0, Math.min((scroll - 0.87) / 0.08, 1.0));
    return progress;
  };

  const aiOpacity = getGeneratedTasksOpacity();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full h-[460px] select-none text-left">
      
      {/* 1. BACKLOG */}
      <div 
        style={getColumnProps(0)} 
        className="flex flex-col h-full bg-[#0d0c10]/42 rounded-xl p-3 border border-white/5 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-gray-400">BACKLOG</span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">
            {ai.status === "completed" ? "6" : "3"}
          </span>
        </div>
        
        <div className="flex flex-col gap-2 overflow-hidden">
          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">API Architecture</div>
            <div className="text-[10px] text-[#cba358] mt-1 font-mono">HIGH PRIORITY</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Auth Redesign</div>
            <div className="text-[10px] text-gray-500 mt-1">Refining cookies</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Database Migration</div>
            <div className="text-[10px] text-gray-500 mt-1">Postgres 16 upgrade</div>
          </div>

          {/* AI Generated Tasks appearing dynamically */}
          {aiOpacity > 0 && (
            <div 
              style={{ opacity: aiOpacity, transform: `translateY(${(1 - aiOpacity) * 15}px)` }} 
              className="flex flex-col gap-2 transition-all duration-300"
            >
              <div className="glass-card border border-[#cba358]/20 bg-[#cba358]/5 p-3 rounded-lg cursor-pointer">
                <div className="text-xs font-medium text-[#f7ead2]">AI Assistant Setup</div>
                <div className="text-[9px] text-[#cba358] mt-0.5 font-mono">GENERATED</div>
              </div>
              <div className="glass-card border border-[#cba358]/15 bg-[#cba358]/5 p-3 rounded-lg cursor-pointer">
                <div className="text-xs font-medium text-gray-300">Damped Camera Rig Tests</div>
                <div className="text-[9px] text-gray-500 mt-0.5">Refined parallax</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. TODO */}
      <div 
        style={getColumnProps(1)} 
        className="flex flex-col h-full bg-[#0d0c10]/42 rounded-xl p-3 border border-white/5 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-gray-400">TODO</span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">2</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* AI Action Card */}
          <div className="border border-[#cba358]/20 bg-[#161311]/85 p-3 rounded-lg shadow-[0_4px_12px_rgba(203,163,88,0.04)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[#cba358] font-mono tracking-wider font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#cba358] animate-pulse" />
              AKIRA AI
            </div>
            <div className="text-xs font-semibold text-[#f7ead2] mt-1.5 h-6 flex items-center">
              {ai.text}
              {ai.status === "typing" && (
                <span className="inline-block w-1 h-3 ml-1 bg-[#cba358] animate-pulse" />
              )}
            </div>
            {ai.status === "idle" && (
              <button className="w-full text-center py-1 mt-2 text-[9px] font-medium text-[#ffe9a0] border border-[#cba358]/35 rounded hover:bg-[#cba358]/10 transition-colors">
                Run Generator
              </button>
            )}
          </div>

          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Workspace Settings</div>
            <div className="text-[10px] text-gray-500 mt-1">UI layout schema</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Notification Center</div>
            <div className="text-[10px] text-gray-500 mt-1">Real-time socket feeds</div>
          </div>
        </div>
      </div>

      {/* 3. IN PROGRESS */}
      <div 
        style={getColumnProps(2)} 
        className="flex flex-col h-full bg-[#0d0c10]/42 rounded-xl p-3 border border-white/5 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-gray-400">IN PROGRESS</span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">
            {scroll >= 0.86 ? "1" : "2"}
          </span>
        </div>

        <div className="flex flex-col gap-2 relative">
          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Kanban Interaction</div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-12 h-1 bg-white/10 rounded overflow-hidden">
                <div className="w-4/5 h-full bg-[#cba358]" />
              </div>
              <span className="text-[8px] font-mono text-gray-500">80%</span>
            </div>
          </div>

          {/* This is the Choreographed moving card */}
          <div 
            style={getMovingCardStyle()}
            className="absolute top-[68px] left-0 w-full z-30 glass-card border bg-[#141217]/85 p-3 rounded-lg cursor-pointer transition-all duration-75"
          >
            <div className="text-xs font-semibold text-gray-200">AI Sprint Planning</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[8px] font-mono text-[#cba358]">ACTIVE NOW</span>
              <div className="flex -space-x-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-600 border border-black text-[7px] flex items-center justify-center font-mono">R</div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#cba358] border border-black text-[7px] text-black flex items-center justify-center font-bold font-mono">A</div>
              </div>
            </div>
          </div>

          {/* Placeholder spacer slot to prevent layout jump while card is translating */}
          <div className="h-[68px] w-full border border-dashed border-white/5 rounded-lg opacity-25" />
        </div>
      </div>

      {/* 4. REVIEW */}
      <div 
        style={getColumnProps(3)} 
        className="flex flex-col h-full bg-[#0d0c10]/42 rounded-xl p-3 border border-white/5 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-gray-400">REVIEW</span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">
            {scroll >= 0.86 ? "3" : "2"}
          </span>
        </div>

        <div className="flex flex-col gap-2 relative">
          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">RBAC Implementation</div>
            <div className="text-[10px] text-gray-500 mt-1">Role authorization gates</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-white/5 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-200">Analytics Module</div>
            <div className="text-[10px] text-gray-500 mt-1">Burn-down chart engines</div>
          </div>

          {/* Empty space that gets filled by the moving card */}
          {scroll < 0.86 && (
            <div className="h-[68px] w-full border border-dashed border-white/5 rounded-lg opacity-20 flex items-center justify-center text-[9px] text-gray-600 font-mono">
              WAITING
            </div>
          )}
          {scroll >= 0.86 && (
            <div className="h-[68px] w-full" />
          )}
        </div>
      </div>

      {/* 5. DONE */}
      <div 
        style={getColumnProps(4)} 
        className="flex flex-col h-full bg-[#0d0c10]/42 rounded-xl p-3 border border-white/5 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-gray-400">DONE</span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#cba358] font-mono">3</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="glass-card hover:translate-z-32 border border-[#cba358]/10 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-300 line-through decoration-white/10">Authentication</div>
            <div className="text-[10px] text-[#cba358] mt-1 font-mono">COMPLETED</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-[#cba358]/10 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-300 line-through decoration-white/10">Project Creation</div>
            <div className="text-[10px] text-[#cba358] mt-1 font-mono">COMPLETED</div>
          </div>

          <div className="glass-card hover:translate-z-32 border border-[#cba358]/10 bg-[#141217]/55 p-3 rounded-lg hover:border-[#cba358]/20 transition-all duration-200 cursor-pointer">
            <div className="text-xs font-medium text-gray-300 line-through decoration-white/10">Team Management</div>
            <div className="text-[10px] text-[#cba358] mt-1 font-mono">COMPLETED</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InteractiveKanban;
