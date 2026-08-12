import React from "react";
import { Link } from "react-router-dom";

export const IntroSequence: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-[85vh] flex flex-col justify-center items-center px-6 lg:px-12 py-16 text-center relative z-20 select-none">
      {/* Eyebrow */}
      <div className="font-mono text-xs text-[#8b8a90] tracking-[4px] uppercase mb-8">
        Akira PM — the operating system for engineering teams
      </div>

      {/* Main Editorial Headline */}
      <h1 className="font-serif italic font-normal text-6xl sm:text-7xl md:text-8xl lg:text-[110px] text-[#f3f1ec] leading-[1.02] tracking-tight max-w-5xl">
        Work, in <span className="text-[#ff4d2e] relative">motion</span>.
      </h1>

      {/* Subtitle */}
      <p className="max-w-[560px] mx-auto mt-8 text-[#8b8a90] text-base md:text-lg leading-relaxed font-sans">
        Every ticket, sprint, and shipped release — moving in one place. Built for teams who'd rather build than manage the board.
      </p>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <Link
          to="/register"
          className="bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] px-6 py-3 rounded-md text-sm font-semibold transition-all active:scale-97 cursor-pointer"
        >
          Start building →
        </Link>
        <a
          href="#board"
          className="bg-transparent text-[#f3f1ec] border border-[#26262b] hover:border-[#8b8a90] px-6 py-3 rounded-md text-sm font-medium transition-colors"
        >
          Explore the platform
        </a>
      </div>

      {/* Scroll Cue with dropping animation line */}
      <div className="flex flex-col items-center gap-2.5 mt-20 opacity-70">
        <span className="font-mono text-[11px] text-[#8b8a90] tracking-[2px] uppercase">
          scroll
        </span>
        <div className="w-[1px] h-[40px] bg-gradient-to-b from-[#8b8a90] to-transparent relative overflow-hidden">
          <div className="absolute top-[-100%] left-0 w-full h-full bg-[#ff4d2e] animate-[cue-drop_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default IntroSequence;
