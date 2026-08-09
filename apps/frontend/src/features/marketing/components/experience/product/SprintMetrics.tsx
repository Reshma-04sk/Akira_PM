import React from "react";

export const SprintMetrics: React.FC = () => {
  return (
    <div className="flex items-center gap-6 px-6 py-2.5 bg-[#0D1016]/40 border-b border-white/8 select-none w-full text-left">
      {/* 1. Sprint progress */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>Sprint Progress</span>
          <span className="text-[#7c8cff] font-semibold">68%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-[#7c8cff] rounded-full" />
          </div>
          <span className="text-[9px] font-mono text-gray-400">18/32 pts</span>
        </div>
      </div>

      <div className="h-6 w-px bg-white/5" />

      {/* 2. Velocity */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Velocity</span>
        <span className="text-xs font-semibold text-gray-200 mt-0.5">
          42 pts <span className="text-[9px] text-gray-500 font-normal font-mono">(avg)</span>
        </span>
      </div>

      <div className="h-6 w-px bg-white/5" />

      {/* 3. Cycle Time */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Cycle Time</span>
        <span className="text-xs font-semibold text-gray-200 mt-0.5">
          3.8 days <span className="text-[9px] text-[#55d6ff] font-mono">&darr; 0.4d</span>
        </span>
      </div>

      <div className="h-6 w-px bg-white/5" />

      {/* 4. Active Tasks */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Active State</span>
        <span className="text-xs font-semibold text-gray-300 mt-0.5">
          9 In Progress <span className="text-gray-500 font-mono">&middot;</span> 5 Review
        </span>
      </div>
    </div>
  );
};

export default SprintMetrics;
