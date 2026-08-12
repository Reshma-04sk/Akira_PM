import React, { useState, useEffect, useRef } from "react";

export const AiRecapSection: React.FC = () => {
  const [typedIndex, setTypedIndex] = useState<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<boolean>(false);

  const changes = [
    "✓ 8 tasks shipped to production",
    "→ 4 tasks moved to review (PR #412, #415)",
    "⚠ 1 blocker detected: Webhook retry strategy API key",
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            let current = 0;
            const interval = setInterval(() => {
              current++;
              setTypedIndex(current);
              if (current >= changes.length) clearInterval(interval);
            }, 600);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [changes.length]);

  return (
    <section id="ai" ref={sectionRef} className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            07 · AI Daily Recap
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Akira reads what moved.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            AI-generated standup recaps and blocker detection — written from real board activity.
          </p>
        </div>

        {/* AI Recap Card */}
        <div className="max-w-3xl mx-auto bg-[#131316] border border-[#26262b] rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#26262b] mb-6 font-mono text-xs text-[#8b8a90]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff4d2e] animate-ping" />
              DAILY RECAP · SPRINT 14 · 3 CHANGES DETECTED
            </div>
            <span>AKIRA AI</span>
          </div>

          {/* Activity Changes */}
          <div className="flex flex-col gap-3 font-mono text-xs text-[#f3f1ec] mb-8">
            {changes.slice(0, typedIndex).map((item, i) => (
              <div
                key={i}
                className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-3 flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-[10px] text-[#ff4d2e]">DETECTED</span>
              </div>
            ))}
          </div>

          {/* AI Suggested Action */}
          <div className="bg-[#1b1b1f] border border-[#ff4d2e]/30 rounded-xl p-5 mb-6">
            <div className="font-mono text-xs text-[#ff4d2e] mb-2 uppercase font-bold">
              SUGGESTED ACTION
            </div>
            <p className="text-sm text-[#f3f1ec] font-sans leading-relaxed">
              "Move AK-118 into Sprint 15 and assign MN for API review."
            </p>
          </div>

          {/* Apply Suggestion Action */}
          <div className="flex items-center justify-between pt-4 border-t border-[#26262b]">
            <span className="text-xs text-[#8b8a90] font-mono">
              AUTO-BALANCING SPRINT CAPACITY
            </span>
            <button className="bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] px-5 py-2.5 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer">
              Apply suggestion →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiRecapSection;
