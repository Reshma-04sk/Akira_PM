import React from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useMousePosition } from "../hooks/useMousePosition";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { AkiraCanvas } from "../components/experience/Scene/AkiraCanvas";

export const HomePage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const scrollRef = useScrollProgress();
  const mouseRef = useMousePosition();

  // 10 baseline scroll sections for Phase 1 testing
  const SECTIONS = [
    { title: "Chapter 1: Arrival (0% - 20%)", label: "Camera: 85mm slow dolly. Light: Dark" },
    { title: "Chapter 2: Intelligence (20% - 30%)", label: "Camera: 85mm pan down. Light: Warm Gold" },
    { title: "Chapter 3: Creation (30% - 40%)", label: "Camera: 50mm tilt down. Light: White" },
    { title: "Chapter 4: Execution (40% - 55%)", label: "Camera: 35mm pan left. Light: Studio" },
    { title: "Chapter 5: Insight (55% - 65%)", label: "Camera: 35mm pan right. Light: Amber" },
    { title: "Chapter 6: Collaboration (65% - 75%)", label: "Camera: 50mm handheld. Light: Trace" },
    { title: "Chapter 7: Security (75% - 85%)", label: "Camera: 50mm close. Light: Blue Rim" },
    { title: "Chapter 8: Scale (85% - 90%)", label: "Camera: 85mm wide. Light: White + Gold" },
    { title: "Chapter 9: Pricing (90% - 95%)", label: "Camera: 50mm low angle. Light: Floor Gold" },
    { title: "Chapter 10: Beginning (95% - 100%)", label: "Camera: 85mm dolly back. Light: Bloom Halo" },
  ];

  return (
    <div className="relative text-[#f3efe6] antialiased bg-transparent min-h-screen">
      {/* 1. Fixed dark backdrop */}
      <div className="fixed inset-0 -z-20 bg-[#07060a]" />

      {/* 2. Persistent R3F Canvas Layer */}
      <AkiraCanvas scrollProgress={scrollRef} mouseRef={mouseRef} />

      {/* 3. HTML Placeholders for scrolling */}
      <div className="relative z-10 bg-transparent flex flex-col">
        {SECTIONS.map((sec) => (
          <section
            key={sec.title}
            className="h-screen flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-8 max-w-md space-y-3">
              <h2 className="text-sm font-mono text-[#d4af37] font-bold uppercase tracking-wider">{sec.title}</h2>
              <p className="text-xs text-[#9a938a] font-medium">{sec.label}</p>
              <div className="text-[10px] text-white/20">Scroll to transition camera rig and studio lights</div>
            </div>
          </section>
        ))}
      </div>

      {/* 4. Motion accessibility style overrides */}
      {prefersReduced && (
        <style
          dangerouslySetInnerHTML={{
            __html: `*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }`,
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
