import React, { useState, useEffect, useRef } from "react";

export const StorySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIdx = parseInt(entry.target.getAttribute("data-step") || "0", 10);
            setActiveStep(stepIdx);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -10% 0px" }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="story" className="w-full max-w-[1100px] mx-auto my-32 px-6 relative z-10 select-none">
      {/* Section Header */}
      <div className="text-center max-w-[560px] mx-auto mb-16 reveal visible">
        <div className="font-mono text-xs text-[#8b8a90] tracking-[4px] uppercase mb-4">
          how it works
        </div>
        <h2 className="font-serif italic text-3xl md:text-4xl text-[#f3f1ec] font-normal leading-[1.15] mb-3.5">
          From scattered to shipped.
        </h2>
        <p className="text-[#8b8a90] text-base leading-relaxed">
          The same work, four states. Scroll to watch it settle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-16">
        {/* Left Side Steps */}
        <div className="flex flex-col gap-32 md:gap-44 py-10">
          {/* Step 01 */}
          <div
            ref={(el) => { stepRefs.current[0] = el; }}
            data-step="0"
            className={`max-w-[380px] transition-opacity duration-400 ${
              activeStep === 0 ? "opacity-100" : "opacity-35"
            }`}
          >
            <span className="font-mono text-xs text-[#ff4d2e] block mb-3.5">01</span>
            <h3 className="font-serif italic text-2xl md:text-3xl text-[#f3f1ec] font-normal leading-snug mb-3">
              Tools everywhere, context nowhere
            </h3>
            <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed">
              Tickets in one app, docs in another, standups in a third. Nobody has the full picture — least of all you.
            </p>
          </div>

          {/* Step 02 */}
          <div
            ref={(el) => { stepRefs.current[1] = el; }}
            data-step="1"
            className={`max-w-[380px] transition-opacity duration-400 ${
              activeStep === 1 ? "opacity-100" : "opacity-35"
            }`}
          >
            <span className="font-mono text-xs text-[#ff4d2e] block mb-3.5">02</span>
            <h3 className="font-serif italic text-2xl md:text-3xl text-[#f3f1ec] font-normal leading-snug mb-3">
              Everything lands on one board
            </h3>
            <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed">
              Issues, docs, and conversations resolve into a single live board. No more tab-switching to find state.
            </p>
          </div>

          {/* Step 03 */}
          <div
            ref={(el) => { stepRefs.current[2] = el; }}
            data-step="2"
            className={`max-w-[380px] transition-opacity duration-400 ${
              activeStep === 2 ? "opacity-100" : "opacity-35"
            }`}
          >
            <span className="font-mono text-xs text-[#ff4d2e] block mb-3.5">03</span>
            <h3 className="font-serif italic text-2xl md:text-3xl text-[#f3f1ec] font-normal leading-snug mb-3">
              Progress, visible in real time
            </h3>
            <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed">
              Velocity, blockers, and shipped work update themselves. The board tells the story so standup doesn't have to.
            </p>
          </div>

          {/* Step 04 */}
          <div
            ref={(el) => { stepRefs.current[3] = el; }}
            data-step="3"
            className={`max-w-[380px] transition-opacity duration-400 ${
              activeStep === 3 ? "opacity-100" : "opacity-35"
            }`}
          >
            <span className="font-mono text-xs text-[#ff4d2e] block mb-3.5">04</span>
            <h3 className="font-serif italic text-2xl md:text-3xl text-[#f3f1ec] font-normal leading-snug mb-3">
              Akira writes the recap
            </h3>
            <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed">
              At the end of the day, AI drafts the standup update from what actually moved — you just approve and send.
            </p>
          </div>
        </div>

        {/* Right Side Sticky Visual Frame */}
        <div className="md:sticky md:top-28 h-[340px] w-full">
          <div className="relative h-full bg-[#131316] border border-[#26262b] rounded-2xl overflow-hidden shadow-2xl p-7">
            {/* Panel 0: Scattered Tools */}
            <div
              className={`absolute inset-0 p-7 transition-opacity duration-500 ${
                activeStep === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute top-[10%] left-[8%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Slack thread
              </div>
              <div className="absolute top-[30%] left-[50%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Notion doc
              </div>
              <div className="absolute top-[60%] left-[15%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Jira ticket
              </div>
              <div className="absolute top-[15%] left-[65%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Email chain
              </div>
              <div className="absolute top-[70%] left-[55%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Figma comment
              </div>
              <div className="absolute top-[45%] left-[32%] px-3 py-2 bg-[#1b1b1f] border border-[#26262b] rounded-lg text-xs text-[#8b8a90]">
                Standup notes
              </div>
            </div>

            {/* Panel 1: Unified Grid */}
            <div
              className={`absolute inset-0 p-7 transition-opacity duration-500 ${
                activeStep === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="grid grid-cols-3 gap-2.5 h-full">
                {["AK-101", "AK-096", "AK-089", "AK-104", "AK-108", "AK-112", "AK-091", "AK-077", "AK-119"].map(
                  (id, i) => (
                    <div
                      key={i}
                      className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-2.5 text-xs text-[#8b8a90] flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] shrink-0" />
                      <span className="font-mono text-[11px]">{id}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Panel 2: Realtime Progress Flow */}
            <div
              className={`absolute inset-0 p-7 flex flex-col justify-center gap-3.5 transition-opacity duration-500 ${
                activeStep === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {[80, 55, 92, 40, 68].map((pct, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2e] shrink-0" />
                  <div className="h-1.5 flex-1 bg-[#1b1b1f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff4d2e] transition-all duration-1000 ease-out"
                      style={{ width: activeStep === 2 ? `${pct}%` : "0%" }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#8b8a90] w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>

            {/* Panel 3: Auto-Drafted AI Recap */}
            <div
              className={`absolute inset-0 p-7 flex flex-col justify-center transition-opacity duration-500 ${
                activeStep === 3 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="font-mono text-[11px] text-[#8b8a90] mb-4">
                DAILY RECAP · AUTO-DRAFTED
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-2.5 text-xs text-[#f3f1ec] flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] shrink-0" />
                  Shipped: keyboard command palette
                </div>
                <div className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-2.5 text-xs text-[#f3f1ec] flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] shrink-0" />
                  In progress: board rewrite (80%)
                </div>
                <div className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-2.5 text-xs text-[#f3f1ec] flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] shrink-0" />
                  Blocked: realtime cursors — waiting on API keys
                </div>
                <div className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-2.5 text-xs text-[#f3f1ec] flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] shrink-0" />
                  Next: onboarding empty states
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
