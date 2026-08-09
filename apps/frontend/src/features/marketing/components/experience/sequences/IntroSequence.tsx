import React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { GradientText } from "../ui/GradientText";

export const IntroSequence: React.FC = () => {
  return (
    <div className="h-[68vh] w-full max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-between text-center select-none">
      {/* Top spacing to offset center element layout */}
      <div className="h-4" />

      {/* Main centerpiece title and description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8 my-auto"
      >
        {/* Subtle premium gold/indigo branding eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-bold uppercase text-[#7c8cff] tracking-[0.45em]"
        >
          AKIRA PM
        </motion.div>

        {/* Large, elegant serif headline with editorial sizing (breathing room) */}
        <motion.h1
          initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-normal text-5xl sm:text-7xl leading-[1.05] tracking-[-2px] mx-auto max-w-3xl"
        >
          <GradientText>Project Management,</GradientText>
          <br />
          <GradientText>Refined.</GradientText>
        </motion.h1>

        {/* Minimal subtitle description - capped at 600px width */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#8b95a5] text-xs sm:text-sm max-w-[520px] mx-auto leading-relaxed tracking-wide font-normal mt-4"
        >
          The operating system for modern engineering teams.
          <br className="hidden sm:block" />
          Built for speed. Designed for clarity.
        </motion.p>
      </motion.div>

      {/* CTA Buttons styled in Linear/Vercel-class product controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full"
      >
        {/* Primary Dark-to-Indigo CTA */}
        <MagneticButton
          to="/register"
          className="px-9 py-4.0 text-[12px] font-bold tracking-wider rounded-lg text-white border border-[#7c8cff]/20 hover:border-[#7c8cff]/40 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #0e1222 0%, #161d36 60%, #2b396a 100%)",
            boxShadow: "0 6px 24px rgba(124, 140, 255, 0.12)",
          }}
        >
          Start Building &rarr;
        </MagneticButton>

        {/* Secondary transparent graphite glass CTA */}
        <MagneticButton
          to="/contact"
          className="px-9 py-4.0 text-[12px] font-bold tracking-wider rounded-lg border border-white/5 hover:border-white/15 bg-white/4 hover:bg-white/8 text-[#8b95a5] hover:text-[#f4f7fa] transition-all backdrop-blur-md cursor-pointer"
        >
          Explore the Platform
        </MagneticButton>
      </motion.div>
    </div>
  );
};

export default IntroSequence;
