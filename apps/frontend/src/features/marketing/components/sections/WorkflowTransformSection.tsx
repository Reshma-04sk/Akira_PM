import React, { useState, useEffect, useRef } from "react";

export const WorkflowTransformSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stages = [
    { label: "PROJECT", title: "CORE ENGINE ROADMAP", detail: "Q3 Engineering Objectives · 4 Sprints planned" },
    { label: "SPRINT", title: "SPRINT 14 VELOCITY", detail: "42 pts targeted · 12 active tasks · Ends in 4 days" },
    { label: "TASK", title: "AK-121 · Command Palette Navigation", detail: "Priority: HIGH · Assigned: RS · Estimate: 3 pts" },
    { label: "REVIEW", title: "AK-121 IN CODE REVIEW", detail: "Pull Request #412 approved by MN · 0 blockers" },
    { label: "SHIP", title: "RELEASED TO PRODUCTION", detail: "Deployed in Build #1842 · Available to all users" },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !interval) {
            interval = setInterval(() => {
              setActiveStage((prev) => (prev + 1) % stages.length);
            }, 2500);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [stages.length]);

  return (
    <section ref={sectionRef} className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            05 · Single Trace Workflow
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Project → Sprint → Task → Ship
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Watch one piece of engineering work transform continuously through the Akira operating system.
          </p>
        </div>

        {/* Stage Stepper Tabs */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-10 overflow-x-auto pb-2">
          {stages.map((stg, i) => (
            <button
              key={i}
              onClick={() => setActiveStage(i)}
              className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                activeStage === i
                  ? "bg-[#ff4d2e] text-[#1a0a06] font-bold shadow-lg"
                  : "bg-[#131316] text-[#8b8a90] border border-[#26262b] hover:text-[#f3f1ec]"
              }`}
            >
              {stg.label}
            </button>
          ))}
        </div>

        {/* Transforming Work Visual Box */}
        <div className="max-w-3xl mx-auto bg-[#131316] border border-[#26262b] rounded-2xl p-8 shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between font-mono text-xs text-[#8b8a90] mb-6 pb-4 border-b border-[#26262b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
              STAGE {activeStage + 1} OF 5 · {stages[activeStage].label}
            </div>
            <span className="text-[#ff4d2e]">LIVE TRACE</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-medium text-[#f3f1ec] mb-3 transition-opacity">
            {stages[activeStage].title}
          </h3>

          <p className="text-sm font-mono text-[#8b8a90] leading-relaxed">
            {stages[activeStage].detail}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorkflowTransformSection;
