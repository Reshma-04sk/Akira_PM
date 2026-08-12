import React from "react";

export const SecurityControlSection: React.FC = () => {
  const roles = [
    { role: "Owner", access: "Full access & billing control" },
    { role: "Manager", access: "Projects + Sprints management" },
    { role: "Developer", access: "Tasks + PR resolution" },
    { role: "Viewer", access: "Read-only board access" },
  ];

  return (
    <section className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            11 · Security & Control
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Control without slowing the team.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Fine-grained role-based access, workspace boundary isolation, and complete audit logging.
          </p>
        </div>

        {/* Roles & Security Table Container */}
        <div className="max-w-3xl mx-auto bg-[#131316] border border-[#26262b] rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="font-mono text-xs text-[#8b8a90] mb-6 pb-4 border-b border-[#26262b] flex items-center justify-between">
            <span>WORKSPACE BOUNDARY · CORE ENGINE</span>
            <span className="text-[#ff4d2e]">ROLE ACCESS CONTROL</span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {roles.map((r, i) => (
              <div
                key={i}
                className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-3.5 flex items-center justify-between"
              >
                <span className="text-[#f3f1ec] font-semibold">{r.role}</span>
                <span className="text-[#8b8a90]">{r.access}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#26262b] font-mono text-[11px] text-[#8b8a90] text-center">
            <div>Role-based access</div>
            <div>Workspace boundaries</div>
            <div>Audit activity</div>
            <div>OAuth 2.0 Auth</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityControlSection;
