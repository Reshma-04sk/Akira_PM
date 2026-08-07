import React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { GradientText } from "../ui/GradientText";

export const IntroSequence: React.FC = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.0, delay: 0.3 }}
        className="space-y-8 max-w-3xl mx-auto"
      >
        {/* Subtle letter-spaced indicator */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="text-[11px] font-bold uppercase text-[#d4af37] tracking-[0.3em]"
        >
          Akira PM
        </motion.div>

        {/* Large serif header */}
        <motion.h1
          initial={{ opacity: 0, y: 35, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-normal text-5xl sm:text-7xl leading-[1.04] tracking-[-1px]"
        >
          <GradientText>Project Management,</GradientText>
          <br />
          <GradientText>Refined.</GradientText>
        </motion.h1>

        {/* Minimal description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.6 }}
          className="text-[#9a938a] text-base max-w-md mx-auto leading-relaxed"
        >
          The operating system for modern engineering teams.
          Built for velocity. Designed for clarity.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <MagneticButton
            to="/register"
            className="px-8 py-3.5 text-[13px] font-bold tracking-wide rounded-full text-[#1a1206]"
            style={{
              background: "linear-gradient(135deg, #ffe9a0, #d4af37 60%, #8a6b1f)",
              boxShadow: "0 0 30px rgba(212, 175, 55, 0.3)",
            }}
          >
            Start Building →
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Floating scroll signifier */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 2.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[9px] tracking-[3px] uppercase text-[#9a938a] font-bold"
      >
        <span>Scroll</span>
        <div className="w-px h-8 overflow-hidden relative bg-white/10">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-full h-1/2 bg-[#d4af37]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default IntroSequence;
