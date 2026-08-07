import React, { memo } from "react";
import { motion } from "framer-motion";
import { KanbanBoard } from "../../KanbanBoard";

export const KanbanSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Execution
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            The Kanban board comes alive.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Tasks flow, priority bars highlight blocker areas, and status bobs with physics.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <KanbanBoard />
        </motion.div>
      </div>
    </div>
  );
});

KanbanSequence.displayName = "KanbanSequence";
export default KanbanSequence;
