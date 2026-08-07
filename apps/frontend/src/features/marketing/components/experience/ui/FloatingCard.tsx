import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse coords mapped to motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to avoid abrupt snapping
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={`glass-panel border border-white/10 p-5 rounded-2xl select-none hover:border-[#d4af37]/30 ${className}`}
    >
      <div style={{ transform: "translateZ(15px)" }}>{children}</div>
    </motion.div>
  );
};

export default FloatingCard;
