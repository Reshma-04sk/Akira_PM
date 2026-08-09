import React from "react";

interface ProjectHeaderProps {
  onAddTask: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ onAddTask }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-[#0D1016]/40 border-b border-white/8 select-none w-full text-left">
      {/* Left side: details */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2">
          <span>Core Engine</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
          <span className="text-[10px] bg-white/5 border border-white/8 text-gray-400 font-mono px-1.5 py-0.5 rounded-sm">
            Active
          </span>
        </h2>
        <div className="flex items-center gap-3 text-[10px] text-[#8b95a5] font-mono leading-none">
          <span>12 members</span>
          <span>&middot;</span>
          <span>Sprint 12</span>
          <span>&middot;</span>
          <span className="text-[#7c8cff] font-semibold">68% complete</span>
        </div>
      </div>

      {/* Right side: controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-1.5 h-7 px-2.5 bg-white/3 border border-white/8 hover:border-white/10 rounded-md text-[10px] text-[#8b95a5] transition-colors cursor-pointer">
          <span>⌕</span>
          <span>Search</span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 h-7 px-2.5 bg-white/3 border border-white/8 hover:border-white/10 rounded-md text-[10px] text-[#8b95a5] transition-colors cursor-pointer">
          <span>⌥</span>
          <span>Filter</span>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 h-7 px-2.5 bg-white/3 border border-white/8 hover:border-white/10 rounded-md text-[10px] text-[#8b95a5] transition-colors cursor-pointer">
          <span>⇅</span>
          <span>Sort</span>
        </div>

        {/* + Add Task button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 h-7 px-3.5 bg-white/9 hover:bg-white text-[#07090d] rounded-md text-[10px] font-bold transition-all hover:scale-102 cursor-pointer focus:outline-none"
        >
          <span>+</span>
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;
