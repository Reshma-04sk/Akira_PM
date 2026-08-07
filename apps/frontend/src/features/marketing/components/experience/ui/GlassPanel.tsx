import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  glow = false,
}) => {
  return (
    <div
      className={`glass-card relative rounded-2xl overflow-hidden border border-[#d4af37]/15
                 bg-[#0a090d]/65 backdrop-blur-xl transition-all duration-300
                 shadow-[0_8px_32px_rgba(0,0,0,0.85)]
                 ${glow ? "hover:border-[#d4af37]/35 shadow-[0_0_20px_rgba(212,175,55,0.06)]" : "hover:border-[#d4af37]/25"}
                 ${className}`}
    >
      {/* Inner top highlight border edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffe9a0]/15 to-transparent" />
      {children}
    </div>
  );
};

export default GlassPanel;
