import React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { GradientText } from "../ui/GradientText";

export const IntroSequence: React.FC = () => {
  return (
    <div className="h-[75vh] w-full max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center justify-between text-center select-none">
      {/* Top spacing to offset center element layout */}
      <div className="h-4" />

      {/* Main centerpiece title and description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.0, delay: 0.3 }}
        className="space-y-10 my-auto"
      >
        {/* Subtle premium gold branding eyebrow */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="text-[11px] font-bold uppercase text-[#d4af37] tracking-[0.4em]"
        >
          Akira PM
        </motion.div>

        {/* Large, elegant serif headline centered exactly in front of the Eclipse */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-normal text-6xl sm:text-8xl leading-[0.96] tracking-[-2px] mx-auto max-w-4xl"
        >
          <GradientText>Project Management,</GradientText>
          <br />
          <GradientText>Refined.</GradientText>
        </motion.h1>

        {/* Minimal subtitle description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.5 }}
          className="text-[#9a938a] text-sm sm:text-base max-w-lg mx-auto leading-relaxed tracking-wide font-normal"
        >
          The operating system for modern engineering teams.
          <br className="hidden sm:block" />
          Built for speed. Designed for clarity.
        </motion.p>
      </motion.div>

      {/* CTA Buttons positioned cleanly below the headline area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.9 }}
        className="flex items-center justify-center gap-6"
      >
        <MagneticButton
          to="/register"
          className="px-9 py-4 text-[13px] font-bold tracking-wide rounded-full text-[#1a1206]"
          style={{
            background: "linear-gradient(135deg, #ffe9a0, #d4af37 60%, #8a6b1f)",
            boxShadow: "0 8px 30px rgba(212, 175, 55, 0.25)",
          }}
        >
          Start Building →
        </MagneticButton>
      </motion.div>
    </div>
  );
};

export default IntroSequence;
