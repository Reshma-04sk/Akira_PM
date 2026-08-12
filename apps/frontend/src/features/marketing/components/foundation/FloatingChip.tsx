import React from "react";
import { motion } from "framer-motion";

interface FloatingChipProps {
  label: string;
  sublabel?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  className?: string;
}

export const FloatingChip: React.FC<FloatingChipProps> = ({
  label,
  sublabel,
  top,
  left,
  right,
  bottom,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 0.45, y: 0 }}
      viewport={{ once: true }}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        y: {
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 1 },
      }}
      style={{ top, left, right, bottom }}
      className={`absolute z-10 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-[#101010]/80 backdrop-blur-sm pointer-events-none select-none ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#a3a3a3]">
        {label}
      </span>
      {sublabel && (
        <span className="font-mono text-[8px] text-[#707070]">
          {sublabel}
        </span>
      )}
    </motion.div>
  );
};

export default FloatingChip;
