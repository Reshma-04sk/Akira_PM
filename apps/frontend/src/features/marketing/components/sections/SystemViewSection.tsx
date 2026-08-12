import React from "react";

export const SystemViewSection: React.FC = () => {
  return (
    <section className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            Act III · Control
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            One workspace for the entire team.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            From high-level roadmap down to every commit and status update.
          </p>
        </div>

        {/* Polished Workspace HTML Mockup */}
        <div className="bg-[#131316] border border-[#26262b] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[420px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-[#1b1b1f] border-r border-[#26262b] p-5 flex flex-col justify-between shrink-0">
            <div>
              <div className="font-semibold text-xs text-[#f3f1ec] flex items-center gap-2 mb-6 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
                AKIRA WORKSPACE
              </div>

              <div className="flex flex-col gap-1 text-xs text-[#8b8a90] font-sans">
                <div className="bg-white/5 text-[#f3f1ec] px-3 py-2 rounded-md font-medium flex items-center justify-between">
                  <span>Projects</span>
                  <span className="font-mono text-[10px] text-[#ff4d2e]">14</span>
                </div>
                <div className="px-3 py-2 hover:text-[#f3f1ec] transition-colors cursor-pointer">
                  Tasks
                </div>
                <div className="px-3 py-2 hover:text-[#f3f1ec] transition-colors cursor-pointer">
                  Sprints
                </div>
                <div className="px-3 py-2 hover:text-[#f3f1ec] transition-colors cursor-pointer">
                  Analytics
                </div>
                <div className="px-3 py-2 hover:text-[#f3f1ec] transition-colors cursor-pointer">
                  Team
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#26262b] font-mono text-[11px] text-[#8b8a90]">
              v2.4.0 · ONLINE
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 md:p-8 bg-[#131316] flex flex-col justify-between">
            <div>
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#26262b] mb-6">
                <div>
                  <h3 className="text-xl font-medium text-[#f3f1ec] mb-1">
                    Core Engine • Sprint 14
                  </h3>
                  <p className="text-xs text-[#8b8a90] font-mono">
                    ACTIVE SPRINT · ENDS IN 4 DAYS
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-[#ff4d2e]/14 text-[#ff4d2e] px-3 py-1 rounded-md">
                    VELOCITY 42 PTS
                  </span>
                  <span className="text-xs font-mono bg-white/6 text-[#8b8a90] px-3 py-1 rounded-md">
                    CYCLE TIME 3.8D
                  </span>
                </div>
              </div>

              {/* Task Preview Rows */}
              <div className="flex flex-col gap-3">
                {[
                  { id: "AK-118", title: "Realtime collaboration cursors", status: "IN PROGRESS", owner: "MN" },
                  { id: "AK-121", title: "Command palette navigation", status: "REVIEW", owner: "RS" },
                  { id: "AK-109", title: "Workspace permission model", status: "REVIEW", owner: "JT" },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-3.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#ff4d2e]">{task.id}</span>
                      <span className="text-[#f3f1ec] font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      <span className="text-[#8b8a90]">{task.status}</span>
                      <span className="w-5 h-5 rounded-full bg-[#ff4d2e]/14 text-[#ff4d2e] flex items-center justify-center">
                        {task.owner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 font-mono text-xs text-[#8b8a90] flex items-center justify-between">
              <span>12 ACTIVE TASKS IN SPRINT</span>
              <span className="text-[#ff4d2e]">82% COMPLETE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemViewSection;
