import React from "react";

export const IntegrationsSection: React.FC = () => {
  const tools = [
    "/git · GitHub Sync",
    "/chat · Slack Standups",
    "/calendar · Sprint Cycles",
    "/pipeline · CI/CD Triggers",
    "/database · Audit Logs",
    "/webhooks · Realtime Events",
  ];

  return (
    <section className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            Act VII · Ecosystem & Integrations
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Fits right into your stack.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Bi-directional sync with Git, Slack, CI/CD pipelines, and internal tools.
          </p>
        </div>

        {/* Integration Badges Row */}
        <div className="flex items-center justify-center gap-4 flex-wrap max-w-4xl mx-auto">
          {tools.map((t, i) => (
            <div
              key={i}
              className="bg-[#131316] border border-[#26262b] hover:border-[#ff4d2e] rounded-xl px-5 py-3 font-mono text-xs text-[#f3f1ec] transition-colors cursor-pointer shadow-lg"
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
