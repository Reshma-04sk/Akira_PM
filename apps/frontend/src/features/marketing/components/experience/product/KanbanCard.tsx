import React from "react";
import { motion } from "framer-motion";

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  progress?: number;
  assignee: string;
  tags?: string[];
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  id,
  title,
  description,
  priority,
  progress,
  assignee,
  tags,
}) => {
  return (
    <motion.div
      layout
      layoutId={id}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.65}
      whileDrag={{ 
        scale: 1.02, 
        zIndex: 50, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
        cursor: "grabbing"
      }}
      style={{
        transform: "translateZ(18px)", // Plane 3: Elevated UI Card Plane
      }}
      className="border border-white/8 bg-[#151A22] hover:border-[#7c8cff]/20 p-4 rounded-lg shadow-md hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-colors duration-250 text-left select-none cursor-grab active:cursor-grabbing"
    >
      {/* 1px cards translation mapping using CSS variables */}
      <div 
        style={{ transform: "translate3d(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * -0.8px), 0)" }}
        className="w-full h-full flex flex-col gap-2 transition-transform duration-75"
      >
        {/* Title */}
        <div className="text-[12px] font-semibold text-[#E8EDF5] tracking-wide line-clamp-1 leading-snug">
          {title}
        </div>

        {/* Short description */}
        {description && (
          <div className="text-[10px] text-[#8b95a5] line-clamp-2 leading-relaxed">
            {description}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-semibold text-[#8b95a5] bg-[#0c0f16]/60 border border-white/8 px-2 py-0.5 rounded-sm hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Optional progress indicator */}
        {progress !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                style={{ width: `${progress}%` }} 
                className="h-full bg-[#7c8cff] rounded-full" 
              />
            </div>
            <span className="text-[8px] font-mono text-gray-500 leading-none">{progress}%</span>
          </div>
        )}

        {/* Metadata and avatar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-[8px] font-mono">
            <span className={`h-1.5 w-1.5 rounded-full ${priority === "HIGH" ? "bg-red-500/80" : "bg-white/10"}`} />
            <span className="text-gray-500 uppercase">{priority}</span>
          </div>

          <div className="w-4.5 h-4.5 rounded-full bg-[#1c2330] border border-white/8 flex items-center justify-center text-[7px] font-bold text-gray-300 font-mono">
            {assignee}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KanbanCard;
