import React from "react";

export const ChaosSection: React.FC = () => {
  const fragments = [
    { label: "AK-104 · Design Review", top: "15%", left: "10%", delay: "0s" },
    { label: "Slack thread #prod-incident", top: "25%", left: "70%", delay: "0.5s" },
    { label: "API Rate-limit Incident", top: "60%", left: "15%", delay: "1s" },
    { label: "Git Commit 8f2a41d", top: "70%", left: "65%", delay: "1.5s" },
    { label: "Production Alert: 504 Gateway", top: "35%", left: "45%", delay: "2s" },
    { label: "Customer Request #412", top: "80%", left: "40%", delay: "0.8s" },
  ];

  return (
    <section className="w-full relative z-10 py-32 overflow-hidden select-none border-t border-[#26262b]/50">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative min-h-[420px] flex flex-col justify-center items-center text-center">
        {/* Floating Work Fragments */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {fragments.map((item, i) => (
            <div
              key={i}
              className="absolute bg-[#1b1b1f] border border-[#26262b] px-3.5 py-2 rounded-lg text-xs font-mono text-[#8b8a90] shadow-lg animate-pulse"
              style={{
                top: item.top,
                left: item.left,
                animationDelay: item.delay,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] inline-block mr-2" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Narrative Copy */}
        <div className="relative z-10 max-w-2xl reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-4">
            Act I · Context Loss
          </div>
          <h2 className="font-serif italic font-normal text-4xl md:text-5xl lg:text-6xl text-[#f3f1ec] leading-[1.15] mb-6">
            Work is everywhere.
          </h2>
          <p className="text-[#8b8a90] text-base md:text-lg leading-relaxed mb-4 font-sans">
            Tickets in one place. Context in another. Decisions somewhere else.
          </p>
          <p className="text-[#f3f1ec] font-mono text-xs tracking-wider uppercase">
            Akira brings the system together →
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChaosSection;
