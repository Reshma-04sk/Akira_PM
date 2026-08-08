import React, { useRef, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = memo(({
  children,
  to,
  className = "",
  style,
  onClick,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Dampen distance translation offsets to 28% strength
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = "translate(0, 0)";
    }
  };

  const buttonContent = (
    <motion.div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
      style={{
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      className={`relative inline-flex items-center justify-center rounded-full text-center transition-all ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  return to ? <Link to={to}>{buttonContent}</Link> : buttonContent;
});

MagneticButton.displayName = "MagneticButton";
export default MagneticButton;
