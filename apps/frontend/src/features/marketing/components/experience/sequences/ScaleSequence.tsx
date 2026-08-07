import React, { memo } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

const ArchNode = memo(({ label, x, y, delay }: { label: string; x: string; y: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
    style={{ left: x, top: y }}
  >
    <motion.div
      animate={{ boxShadow: ["0 0 8px #d4af3740", "0 0 18px #d4af3780", "0 0 8px #d4af3740"] }}
      transition={{ repeat: Infinity, duration: 2.5, delay }}
      className="w-10 h-10 rounded-xl bg-white/[0.05] border border-[#d4af37]/40 backdrop-blur flex items-center justify-center"
    >
      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
    </motion.div>
    <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a938a] text-center leading-tight">
      {label}
    </span>
  </motion.div>
));
ArchNode.displayName = "ArchNode";

export const ScaleSequence: React.FC = memo(() => {
  const NODES = [
    { label: "Workspace", x: "50%", y: "15%", delay: 0 },
    { label: "Projects", x: "25%", y: "35%", delay: 0.1 },
    { label: "Tasks", x: "75%", y: "35%", delay: 0.2 },
    { label: "Calendar", x: "15%", y: "60%", delay: 0.3 },
    { label: "Reports", x: "40%", y: "65%", delay: 0.4 },
    { label: "Teams", x: "65%", y: "65%", delay: 0.5 },
    { label: "AI", x: "85%", y: "60%", delay: 0.6 },
    { label: "Notifications", x: "50%", y: "88%", delay: 0.7 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="max-w-3xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Scale
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Infinite node scale.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Every workspace segment is connected to the central AI timeline core.
          </p>
        </div>

        <GlassPanel className="relative h-72 w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 280" preserveAspectRatio="none">
            {[
              [200, 42, 100, 98], [200, 42, 300, 98],
              [100, 98, 60, 168], [100, 98, 160, 182],
              [300, 98, 260, 182], [300, 98, 340, 168],
              [160, 182, 200, 246], [260, 182, 200, 246],
            ].map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#d4af37" strokeWidth="0.8" strokeOpacity={0.4}
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
              />
            ))}
          </svg>

          {NODES.map((n) => (
            <ArchNode key={n.label} {...n} />
          ))}
        </GlassPanel>
      </div>
    </div>
  );
});

ScaleSequence.displayName = "ScaleSequence";
export default ScaleSequence;
