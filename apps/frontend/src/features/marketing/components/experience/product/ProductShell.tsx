import React, { useState } from "react";
import Sidebar from "./Sidebar";
import WorkspaceHeader from "./WorkspaceHeader";
import ProjectHeader from "./ProjectHeader";
import SprintMetrics from "./SprintMetrics";
import KanbanBoard from "./KanbanBoard";
import CommandPalette from "./CommandPalette";

export const ProductShell: React.FC = () => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAskAkiraOpen, setIsAskAkiraOpen] = useState(false);

  return (
    // Layer 2: macOS Workspace Shell Window frame
    <div className="relative w-full h-full rounded-[18px] border border-white/8 bg-[#0B0E13] shadow-[0_40px_120px_rgba(0,0,0,0.45)] flex overflow-hidden select-none">
      
      {/* Subtle inner highlight border overlay */}
      <div className="absolute inset-0 rounded-[18px] border border-white/[0.025] pointer-events-none z-30" />

      {/* A. Sidebar Navigation Column */}
      <Sidebar />

      {/* B. Main Application Workspace Frame */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* 1. Chrome Header bar */}
        <WorkspaceHeader onAskAkira={() => setIsAskAkiraOpen(true)} />

        {/* 2. Project details header metrics */}
        <ProjectHeader onAddTask={() => setIsAddingTask(true)} />

        {/* 3. Small Sprint metrics bar */}
        <SprintMetrics />

        {/* 4. Kanban board lists */}
        <div className="w-full overflow-x-auto overflow-y-hidden pb-1 flex-grow scrollbar-none snap-x snap-mandatory flex bg-[#10141B]">
          <div className="w-full min-w-[920px] md:min-w-0 flex flex-col flex-grow">
            <KanbanBoard 
              isAddingTask={isAddingTask} 
              onAddTaskComplete={() => setIsAddingTask(false)} 
            />
          </div>
        </div>

        {/* 5. Command Palette search overlays */}
        <CommandPalette 
          isOpen={isAskAkiraOpen} 
          onClose={() => setIsAskAkiraOpen(false)} 
        />
      </div>

    </div>
  );
};

export default ProductShell;
