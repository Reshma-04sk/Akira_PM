import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

const PROMPTS = [
  { q: "Generate Sprint 12 plan", a: ["Backlog aligned with roadmap", "8 items split into tasks", "Assigned: CK, RS"] },
  { q: "Analyze project risks", a: ["1 blocker: Auth API dependency", "Scope creep: 15% increase risk", "Mitigation plan created"] },
  { q: "Summarize sprint velocity", a: ["Average velocity: 48 pts", "Completion rate: 94%", "Sprint goals fully hit"] },
];

export const AISequence: React.FC = memo(() => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const current = PROMPTS[index].q;
    let i = 0;
    setTyped("");
    setShowResults(false);

    const interval = setInterval(() => {
      i++;
      setTyped(current.slice(0, i));
      if (i >= current.length) {
        clearInterval(interval);
        setTimeout(() => setShowResults(true), 400);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % PROMPTS.length);
        }, 4000);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [index]);

  const active = PROMPTS[index];

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 relative z-10">
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Intelligence
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            AI at the core of execution.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Akira PM continuously understands, acts, and organizes your project timeline in the background.
          </p>
        </div>

        <GlassPanel className="p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ffe9a0] to-[#d4af37] flex items-center justify-center shrink-0">
              <span className="text-[#1a1206] text-[10px] font-black">A</span>
            </div>
            <div className="text-xs font-mono text-white flex-grow select-none">
              {typed}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-0.5 h-3.5 bg-[#d4af37] align-middle ml-1"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showResults && (
              <motion.div className="space-y-2.5 pt-2 border-t border-white/5">
                {active.a.map((ans, i) => (
                  <motion.div
                    key={`${index}-${i}`}
                    initial={{ opacity: 0, x: -12, y: 5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: i * 0.12, duration: 0.35 }}
                    className="flex items-center gap-3 text-[11px] text-[#f3efe6]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                    <span>{ans}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </div>
    </div>
  );
});

AISequence.displayName = "AISequence";
export default AISequence;
