import React, { useState, useEffect } from "react";

export const CommandPaletteSection: React.FC = () => {
  const queries = [
    "create task: API rate limiting",
    "switch workspace: Infrastructure Engine",
    "triage exceptions: 504 Gateway Timeout",
    "open sprint 14 velocity analytics",
    "generate standup summary for team",
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % queries.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [queries.length]);

  return (
    <section id="cmd" className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            Act VI · Command Line Navigation
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Keyboard-first operating system.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Jump to any ticket, project, sprint, or command instantly with ⌘K.
          </p>
        </div>

        {/* ⌘K Command Interface Mockup */}
        <div className="max-w-2xl mx-auto bg-[#131316] border border-[#26262b] rounded-2xl p-6 shadow-2xl">
          {/* Input Bar */}
          <div className="flex items-center gap-3 bg-[#1b1b1f] border border-[#26262b] rounded-xl px-4 py-3 text-sm text-[#f3f1ec] mb-4">
            <span className="font-mono text-[#ff4d2e] font-bold">⌘K</span>
            <span className="font-mono text-xs text-[#8b8a90] flex-1">
              {queries[currentIdx]}
            </span>
            <span className="w-2 h-4 bg-[#ff4d2e] animate-pulse" />
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="bg-[#ff4d2e]/14 text-[#ff4d2e] border border-[#ff4d2e]/30 rounded-lg p-3 flex items-center justify-between">
              <span>➔ Execute: {queries[currentIdx]}</span>
              <span className="text-[10px] opacity-80">ENTER</span>
            </div>
            <div className="bg-[#1b1b1f] text-[#8b8a90] rounded-lg p-3 flex items-center justify-between">
              <span>Search documentation</span>
              <span className="text-[10px]">⌘D</span>
            </div>
            <div className="bg-[#1b1b1f] text-[#8b8a90] rounded-lg p-3 flex items-center justify-between">
              <span>View sprint velocity roadmap</span>
              <span className="text-[10px]">⌘R</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommandPaletteSection;
