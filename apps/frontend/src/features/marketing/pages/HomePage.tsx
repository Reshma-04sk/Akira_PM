import React from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useMousePosition } from "../hooks/useMousePosition";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollValue } from "../hooks/useScrollValue";
import { AkiraCanvas } from "../components/experience/Scene/AkiraCanvas";
import { IntroSequence } from "../components/experience/sequences/IntroSequence";
import { WorkspaceShell } from "../components/experience/Product/WorkspaceShell";

export const HomePage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const scrollRef = useScrollProgress();
  const mouseRef = useMousePosition();
  const scrollValue = useScrollValue();

  // Fade out hero title/CTAs smoothly as scroll enters the transition zone
  const heroOpacity = prefersReduced ? (scrollValue > 0.15 ? 0 : 1) : Math.max(0, 1 - scrollValue * 5.0);

  return (
    // Expanded height transparent container to allow negative z-index backdrops to show through
    <div className="relative text-[#f3efe6] antialiased bg-transparent min-h-[250vh]">
      {/* 1. Deep obsidian backdrop (lowest z-index) */}
      <div className="fixed inset-0 -z-20 bg-[#07060a]" />

      {/* 2. Persistent background 3D canvas (renders gold eclipse + stardust, z-index 0) */}
      <AkiraCanvas scrollProgress={scrollRef} mouseRef={mouseRef} />

      {/* 3. Hero copy and description (fades naturally as screen scrolls down) */}
      <div 
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity > 0.1 ? "auto" : "none" }}
        className="relative z-10 w-full h-screen flex flex-col items-center justify-center pointer-events-none transition-opacity duration-75"
      >
        <div className="pointer-events-auto">
          <IntroSequence />
        </div>
      </div>

      {/* 4. Sticky Product Workspace (mounts and materializes based on scroll progress) */}
      <div className="relative z-20 w-full h-[150vh] pointer-events-none">
        <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden">
          <WorkspaceShell scroll={scrollValue} prefersReducedMotion={prefersReduced} />
        </div>
      </div>

      {/* 5. Motion accessibility style overrides */}
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
