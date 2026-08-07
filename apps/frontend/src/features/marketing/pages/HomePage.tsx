import React from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useMousePosition } from "../hooks/useMousePosition";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { AkiraCanvas } from "../components/experience/Scene/AkiraCanvas";

// Import modular Chapter Sequences
import { IntroSequence } from "../components/experience/sequences/IntroSequence";
import { AISequence } from "../components/experience/sequences/AISequence";
import { DashboardSequence } from "../components/experience/sequences/DashboardSequence";
import { KanbanSequence } from "../components/experience/sequences/KanbanSequence";
import { AnalyticsSequence } from "../components/experience/sequences/AnalyticsSequence";
import { CollaborationSequence } from "../components/experience/sequences/CollaborationSequence";
import { EnterpriseSequence } from "../components/experience/sequences/EnterpriseSequence";
import { ScaleSequence } from "../components/experience/sequences/ScaleSequence";
import { PricingSequence } from "../components/experience/sequences/PricingSequence";
import { CTASequence } from "../components/experience/sequences/CTASequence";

export const HomePage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const scrollRef = useScrollProgress();
  const mouseRef = useMousePosition();

  return (
    <div className="relative text-[#f3efe6] antialiased bg-transparent min-h-screen">
      {/* 1. Fixed obsidian background layer */}
      <div className="fixed inset-0 -z-20 bg-[#07060a]" />

      {/* 2. Persistent R3F Canvas Layer */}
      <AkiraCanvas scrollProgress={scrollRef} mouseRef={mouseRef} />

      {/* 3. HTML Chapter Sequences Overlay Layer */}
      <div className="relative z-10 bg-transparent flex flex-col">
        {/* Ch 1: Arrival (Curiosity) */}
        <IntroSequence />

        {/* Ch 2: Intelligence (Wonder) */}
        <AISequence />

        {/* Ch 3: Creation (Control) */}
        <DashboardSequence />

        {/* Ch 4: Execution (Confidence) */}
        <KanbanSequence />

        {/* Ch 5: Insight (Trust) */}
        <AnalyticsSequence />

        {/* Ch 6: Collaboration (Excitement) */}
        <CollaborationSequence />

        {/* Ch 7: Trust (Security) */}
        <EnterpriseSequence />

        {/* Ch 8: Scale (Enterprise Node Mapping) */}
        <ScaleSequence />

        {/* Ch 9: Investment (Pricing Plans) */}
        <PricingSequence />

        {/* Ch 10: Beginning (CTA) */}
        <CTASequence />
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
