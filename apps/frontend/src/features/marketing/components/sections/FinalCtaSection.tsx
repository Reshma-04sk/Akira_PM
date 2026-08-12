import React from "react";
import { Link } from "react-router-dom";

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="w-full relative z-10 py-32 border-t border-[#26262b]/60 text-center select-none bg-[#0a0a0b]">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center">
        <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-4">
          Act VIII · Move Forward
        </div>

        <h2 className="font-serif italic font-normal text-5xl md:text-7xl lg:text-8xl text-[#f3f1ec] leading-tight mb-6">
          Move the work forward.
        </h2>

        <p className="text-[#8b8a90] text-base md:text-lg max-w-lg mb-10 font-sans leading-relaxed">
          One system for every ticket, sprint, decision, and release.
        </p>

        <Link
          to="/register"
          className="bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] px-8 py-3.5 rounded-md text-base font-semibold transition-all active:scale-97 cursor-pointer shadow-2xl"
        >
          Start building →
        </Link>
      </div>
    </section>
  );
};

export default FinalCtaSection;
