import React, { memo } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";

export const CollaborationSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Collaboration
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Synchronized at every coordinate.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Avatars stack with active pulsing halos, showing real-time presence indicators.
          </p>
        </div>

        <GlassPanel className="p-6 space-y-5">
          {/* Member Stack */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["CK", "RS", "PK", "MJ"].map((initials, i) => (
                <motion.div
                  key={initials}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full border-2 border-[#07060a] flex items-center justify-center text-[9px] font-black text-[#1a1206]"
                  style={{
                    background: "linear-gradient(135deg,#ffe9a0,#d4af37)",
                    zIndex: 4 - i,
                  }}
                >
                  {initials}
                </motion.div>
              ))}
            </div>
            <span className="text-[11px] text-[#9a938a] font-medium">4 members active</span>
            <span className="ml-auto text-[10px] font-bold text-[#10b981] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Typing messages */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            {["RS is editing the Kanban workspace", "PK opened rate limiter review PR"].map((msg, idx) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.15 }}
                className="flex items-center gap-2.5 text-[11px] text-[#9a938a]"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: dot * 0.15 }}
                      className="w-1 h-1 rounded-full bg-[#d4af37]"
                    />
                  ))}
                </div>
                <span>{msg}</span>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
});

CollaborationSequence.displayName = "CollaborationSequence";
export default CollaborationSequence;
