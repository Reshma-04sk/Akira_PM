import React from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useMousePosition } from "../hooks/useMousePosition";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { AkiraCanvas } from "../components/experience/Scene/AkiraCanvas";
import { IntroSequence } from "../components/experience/sequences/IntroSequence";

export const HomePage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const scrollRef = useScrollProgress();
  const mouseRef = useMousePosition();

  return (
    // Slightly taller height (130vh) to allow scroll dolly camera push to be tested
    <div className="relative text-[#f3efe6] antialiased bg-transparent min-h-[130vh]">
      {/* 1. Fixed dark backdrop */}
      <div className="fixed inset-0 -z-20 bg-[#07060a]" />

      {/* 2. Persistent R3F Canvas Layer (renders gold eclipse + 300 stardust particles) */}
      <AkiraCanvas scrollProgress={scrollRef} mouseRef={mouseRef} />

      {/* 3. HTML Hero Overlay (centered vertically to align with background eclipse centerpiece) */}
      <div className="relative z-10 bg-transparent h-screen w-full flex flex-col items-center justify-center">
        <IntroSequence />
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
