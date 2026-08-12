import React, { useEffect } from "react";
import Navbar from "../components/experience/ui/Navbar";
import IntroSequence from "../components/experience/sequences/IntroSequence";
import ChaosSection from "../components/sections/ChaosSection";
import ProductDemoBoard from "../components/sections/ProductDemoBoard";
import SystemViewSection from "../components/sections/SystemViewSection";
import WorkflowTransformSection from "../components/sections/WorkflowTransformSection";
import AnalyticsSection from "../components/sections/AnalyticsSection";
import AiRecapSection from "../components/sections/AiRecapSection";
import CommandPaletteSection from "../components/sections/CommandPaletteSection";
import RealtimeCollabSection from "../components/sections/RealtimeCollabSection";
import EcosystemSection from "../components/sections/EcosystemSection";
import SecurityControlSection from "../components/sections/SecurityControlSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import FinalCtaSection from "../components/sections/FinalCtaSection";
import CursorTrailCanvas from "../components/foundation/CursorTrailCanvas";
import LandingAtmosphere from "../components/foundation/LandingAtmosphere";

import "../theme/designSystem.css";

export const HomePage: React.FC = () => {
  // IntersectionObserver for reveal-on-scroll elements
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, []);

  return (
    <div className="marketing-theme min-h-screen relative bg-[#0a0a0b] text-[#f3f1ec] font-sans antialiased overflow-x-hidden w-full">
      {/* 00 - Fixed Atmosphere & Cursor Trail */}
      <CursorTrailCanvas />
      <LandingAtmosphere />

      {/* 01 - Header Navigation */}
      <Navbar />

      {/* 01 - Hero Section */}
      <section id="hero" className="w-full relative z-10">
        <IntroSequence />
      </section>

      {/* 02 - Chaos */}
      <ChaosSection />

      {/* 03 - Kanban / Work in Motion */}
      <ProductDemoBoard />

      {/* 04 - Akira Workspace */}
      <SystemViewSection />

      {/* 05 - Project -> Sprint -> Task -> Ship */}
      <WorkflowTransformSection />

      {/* 06 - Engineering Analytics */}
      <AnalyticsSection />

      {/* 07 - AI Daily Recap */}
      <AiRecapSection />

      {/* 08 - ⌘K Command System */}
      <CommandPaletteSection />

      {/* 09 - Real-time Collaboration */}
      <RealtimeCollabSection />

      {/* 10 - Automation / Ecosystem */}
      <EcosystemSection />

      {/* 11 - Security / Control */}
      <SecurityControlSection />

      {/* 12 - Testimonial */}
      <TestimonialsSection />

      {/* 13 - Final CTA (No Pricing!) */}
      <FinalCtaSection />

      {/* 14 - Footer */}
      <footer id="footer" className="w-full border-t border-[#26262b] px-6 lg:px-16 py-12 relative z-10 bg-[#0a0a0b] flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="font-semibold tracking-[2px] text-sm flex items-center gap-2.5 text-[#f3f1ec]">
          <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
          AKIRA
        </div>
        <div className="text-xs text-[#8b8a90] font-mono">
          &copy; 2026 Akira PM. Work, in motion.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
