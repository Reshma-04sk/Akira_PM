import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(interval);
      } else {
        setVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{val}{suffix}</span>;
};

export const AnalyticsSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Insight
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Ecosystem metrics in real time.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Automatic timeline path draws, velocity tracking, and workload highlights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Velocity bar chart */}
          <GlassPanel className="p-5 space-y-4">
            <p className="text-[10px] text-[#9a938a] uppercase tracking-widest font-bold">Team Velocity</p>
            <div className="flex items-end gap-2 h-20">
              {[42, 38, 55, 48, 62, 57, 72].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ background: i === 6 ? "#d4af37" : `rgba(212,175,55,${0.15 + i * 0.08})` }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                  custom={{ transformOrigin: "bottom" }}
                />
              ))}
            </div>
            <p className="text-lg font-black text-[#d4af37]">
              <Counter target={72} suffix=" pts" />{" "}
              <span className="text-[11px] text-[#10b981] font-bold">↑ 23%</span>
            </p>
          </GlassPanel>

          {/* Activity heatmap grid */}
          <GlassPanel className="p-5 space-y-4">
            <p className="text-[10px] text-[#9a938a] uppercase tracking-widest font-bold">Workspace Commits</p>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: 28 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <motion.div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      background:
                        intensity > 0.7
                          ? "#d4af37"
                          : intensity > 0.4
                          ? "rgba(212,175,55,0.45)"
                          : "rgba(255,255,255,0.06)",
                    }}
                    initial={{ opacity: 0, scale: 0.2 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                  />
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
});

AnalyticsSequence.displayName = "AnalyticsSequence";
export default AnalyticsSequence;
