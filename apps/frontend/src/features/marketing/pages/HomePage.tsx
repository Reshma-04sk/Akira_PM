import React from "react";
import { ExperienceProvider } from "../components/experience/hooks/ExperienceContext";
import { AkiraCanvas } from "../components/experience/Scene/AkiraCanvas";
import { ProductSurface } from "../components/experience/ui/ProductSurface";
import { IntroSequence } from "../components/experience/sequences/IntroSequence";
import { Navbar } from "../components/experience/ui/Navbar";
import { useScrollValue } from "../hooks/useScrollValue";
import { useReducedMotion } from "../hooks/useReducedMotion";

const HomeContent: React.FC = () => {
  const scrollValue = useScrollValue();
  const prefersReduced = useReducedMotion();

  // Hero exit translation mapping (occurs between scroll 0.20 and 0.40)
  const exitProgress = Math.min(1, Math.max(0, (scrollValue - 0.20) / 0.20));
  const easeExit = 1 - Math.pow(1 - exitProgress, 3); // cubic ease-out

  const heroOpacity = Math.max(0, 1 - easeExit);
  const heroTranslateY = prefersReduced ? 0 : easeExit * -80;
  const heroScale = prefersReduced ? 1 : 1 - easeExit * 0.03;

  return (
    // Total document height set to 300vh (100vh hero + 100vh reveal + 100vh hold)
    <div className="relative min-h-[300vh] text-[#f4f7fa] bg-[#07090d] flex flex-col items-center justify-between">
      
      {/* 1. Translucent public Navbar */}
      <Navbar />

      {/* 2. Fixed layer containing backgrounds and Canvas particles */}
      <div className="fixed inset-0 pointer-events-none -z-20">
        <AkiraCanvas />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[340px] bg-[#7c8cff]/4 rounded-full blur-[140px]" />
      </div>

      {/* 3. Sticky viewport layer (100vh) capturing the transform sequences */}
      <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-none z-10">
        {/* Product Surface centered beneath typography */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ProductSurface />
        </div>

        {/* Hero title centered inside sticky viewport */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            style={{ 
              opacity: heroOpacity, 
              transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
              pointerEvents: heroOpacity > 0.1 ? "auto" : "none" 
            }}
            className="w-full transition-all duration-75"
          >
            <IntroSequence />
          </div>
        </div>
      </div>

      {/* 4. Normal document spacer (200vh) to guide native scroll values */}
      <div className="h-[200vh] w-full pointer-events-none" />

      {/* 5. Minimal footer scrolling into view at the very end of the page flow */}
      <footer className="w-full py-12 border-t border-white/5 bg-[#07090d] flex flex-col sm:flex-row items-center justify-between px-10 text-[10px] text-gray-600 font-mono relative z-20">
        <span>&copy; 2026 Akira Labs. All rights reserved.</span>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Security</span>
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>

    </div>
  );
};

export const HomePage: React.FC = () => {
  return (
    <ExperienceProvider>
      <HomeContent />
    </ExperienceProvider>
  );
};

export default HomePage;
