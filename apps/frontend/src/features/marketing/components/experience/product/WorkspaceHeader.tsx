import React from "react";

interface WorkspaceHeaderProps {
  onAskAkira: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onAskAkira }) => {
  return (
    <header 
      style={{ transform: "translate3d(calc(var(--mouse-x) * 2px), calc(var(--mouse-y) * -1.5px), 0)" }}
      className="h-13 border-b border-white/8 bg-[#0D1016]/40 px-6 flex items-center justify-between select-none shrink-0 w-full transition-transform duration-75 text-left"
    >
      {/* 1. Left controls: macOS style traffic lights placeholder + Brand workspace */}
      <div className="flex items-center gap-4">
        {/* Mock window traffic light controls */}
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-px bg-white/5" />
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold text-[#E8EDF5] tracking-wider uppercase leading-none">
            AKIRA
          </span>
          <span className="text-[8px] text-gray-500 font-mono mt-0.5 leading-none">
            Core Engineering
          </span>
        </div>
      </div>

      {/* 2. Central Section detail */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono">
          Core Engine
        </span>
        <span className="text-gray-600 font-mono text-xs">/</span>
        <span className="text-[10px] font-semibold text-[#7c8cff] uppercase tracking-widest font-mono">
          Sprint 12
        </span>
      </div>

      {/* 3. Right items: Ask Akira AI, Search box, Avatars, notifications */}
      <div className="flex items-center gap-3.5">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 h-7 px-3 bg-[#07090d]/65 border border-white/8 rounded-md text-[10px] text-gray-500 w-44 hover:border-white/10 transition-colors cursor-pointer">
          <span>⌕</span>
          <span>Search...</span>
          <span className="ml-auto font-mono text-[8px] bg-white/5 px-1 rounded text-gray-600">
            ⌘K
          </span>
        </div>

        {/* ✦ Ask Akira ⌘K (AI Command Trigger) */}
        <div 
          onClick={onAskAkira}
          className="flex items-center gap-1.5 h-7 px-3 bg-[#7c8cff]/10 hover:bg-[#7c8cff]/20 border border-[#7c8cff]/25 hover:border-[#7c8cff]/40 rounded-md text-[10px] font-bold text-[#7c8cff] shadow-sm transition-all cursor-pointer"
        >
          <span>✦</span>
          <span>Ask Akira</span>
          <span className="font-mono text-[7.5px] opacity-70 ml-1">⌘K</span>
        </div>

        {/* Avatars */}
        <div className="flex -space-x-1.5 items-center">
          <div className="w-5.5 h-5.5 rounded-full bg-[#1e264a] border border-black text-[8px] flex items-center justify-center font-bold text-gray-300 font-mono">A</div>
          <div className="w-5.5 h-5.5 rounded-full bg-[#1b3d30] border border-black text-[8px] flex items-center justify-center font-bold text-gray-300 font-mono">M</div>
          <div className="w-5.5 h-5.5 rounded-full bg-gray-700 border border-black text-[8px] flex items-center justify-center font-bold text-gray-400 font-mono">R</div>
        </div>

        <div className="h-4.5 w-px bg-white/5" />

        {/* Notification bell badge */}
        <div className="relative cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-sm text-gray-400 leading-none">▤</span>
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-[#7c8cff] rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
