import React from "react";
import InteractiveKanban from "./InteractiveKanban";

interface WorkspaceShellProps {
  scroll: number; // Stateful damped scroll value (0.0 -> 1.0)
  prefersReducedMotion?: boolean;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  scroll,
  prefersReducedMotion = false,
}) => {
  // Materialization mapping: 0.40 -> 0.58
  const start = 0.40;
  const end = 0.58;

  let progress = 0;
  if (scroll > start) {
    progress = Math.min((scroll - start) / (end - start), 1.0);
  }

  // Linear progress mapped to custom cubic-bezier (0.16, 1, 0.3, 1) approximation
  const easeProgress = 1 - Math.pow(1 - progress, 4);

  // Layout animations
  const opacity = prefersReducedMotion ? (scroll > start ? 1 : 0) : easeProgress;
  const scale = prefersReducedMotion ? 1 : 0.92 + 0.08 * easeProgress;
  const blur = prefersReducedMotion ? 0 : 16 * (1 - easeProgress);
  const rotateX = prefersReducedMotion ? 0 : 12 * (1 - easeProgress);
  const rotateY = prefersReducedMotion ? 0 : -6 * (1 - easeProgress);

  return (
    <div className="w-full relative z-30 pointer-events-auto">
      {/* 3D Glass Workspace boundary layout */}
      <div
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          perspective: "1600px",
        }}
        className="w-full max-w-7xl mx-auto px-6 relative transition-all duration-75"
      >
        {/* Soft radial gold spotlight backing behind the glass panel */}
        <div className="absolute inset-0 bg-radial-gold opacity-10 rounded-2xl blur-3xl pointer-events-none" />

        {/* The Glass Outer Workspace Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a090d]/65 backdrop-blur-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.92)]">
          {/* Header Bar details (macOS window style buttons) */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="text-[10px] tracking-wider text-gray-500 font-semibold uppercase ml-3 font-mono">
                AKIRA WORKSPACE &mdash; REFINED SPRINT
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[9px] bg-[#cba358]/10 text-[#ffe9a0] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                AUTOMATED WORKFLOWS
              </span>
            </div>
          </div>

          {/* Render the core columns. On mobile, we flow horizontal overflow-x-auto for smooth swiping */}
          <div className="w-full overflow-x-auto overflow-y-hidden pb-2 scrollbar-none snap-x snap-mandatory">
            <div className="min-w-[1100px] md:min-w-0">
              <InteractiveKanban scroll={scroll} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceShell;
