import React, { memo } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

export const DashboardSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Creation
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Structure and workspace assemble.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Glass panels slide together magnetically, housing your workspace segments.
          </p>
        </div>

        <GlassPanel className="w-full overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] bg-black/40">
          {/* Header row */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between px-5 py-3.5 border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#ffe9a0] to-[#d4af37]" />
              <span className="text-[11px] font-serif text-[#ffe9a0] tracking-wider">Akira PM</span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#9a938a] font-medium"
            >
              <div className="w-2 h-2 rounded-sm bg-[#d4af37]" />
              General Workspace
            </motion.div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#9a938a]">
                <span>⌘K Search</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffe9a0] to-[#d4af37] flex items-center justify-center text-[8px] font-black text-[#1a1206]">
                CK
              </div>
            </div>
          </motion.div>

          {/* Sidebar and content */}
          <div className="flex min-h-[260px]">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-40 border-r border-white/5 p-3 flex flex-col gap-1 shrink-0"
            >
              {["Dashboard", "Projects", "Tasks", "Calendar", "Reports"].map((v) => (
                <div
                  key={v}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${
                    v === "Tasks" ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25" : "text-[#9a938a]"
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full ${v === "Tasks" ? "bg-[#d4af37]" : "bg-white/15"}`} />
                  {v}
                </div>
              ))}
            </motion.div>

            <div className="flex-1 p-5 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between items-center"
              >
                <span className="text-xs font-bold text-white">Sprint 12</span>
                <span className="text-[9px] px-2 py-1 rounded bg-[#d4af37]/15 text-[#d4af37] font-bold uppercase tracking-wider">
                  Active
                </span>
              </motion.div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Burndown", v: "84%", c: "#10b981" },
                  { l: "Open Tasks", v: "14", c: "#d4af37" },
                  { l: "Velocity", v: "48 pts", c: "#8b5cf6" },
                ].map(({ l, v, c }, idx) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="bg-white/[0.03] border border-white/10 p-3 rounded-xl"
                  >
                    <p className="text-[9px] text-[#9a938a] uppercase tracking-wider mb-1">{l}</p>
                    <p className="text-sm font-black" style={{ color: c }}>{v}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
});

DashboardSequence.displayName = "DashboardSequence";
export default DashboardSequence;
