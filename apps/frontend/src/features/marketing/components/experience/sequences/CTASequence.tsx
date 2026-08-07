import React, { memo } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { GradientText } from "../ui/GradientText";

export const CTASequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ margin: "-15%" }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl mx-auto w-full text-center rounded-3xl p-12 sm:p-16 overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Ambient radial gold pulse glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.5 }}
            className="text-[10px] font-bold uppercase text-[#d4af37] tracking-[0.3em]"
          >
            The Beginning
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-normal text-3xl sm:text-5xl leading-tight"
          >
            <GradientText>The future of project</GradientText>
            <br />
            <GradientText>management starts here.</GradientText>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#9a938a] text-sm leading-relaxed max-w-md mx-auto"
          >
            Start building with Akira PM. Invite your team and unlock intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          >
            <MagneticButton
              to="/register"
              className="px-10 py-4 text-[14px] font-black tracking-wide rounded-full text-[#1a1206] cursor-pointer"
              style={{
                background: "linear-gradient(135deg,#ffe9a0,#d4af37 60%,#8a6b1f)",
                boxShadow: "0 0 40px rgba(212, 175, 55, 0.35), 0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              Start Building →
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

CTASequence.displayName = "CTASequence";
export default CTASequence;
