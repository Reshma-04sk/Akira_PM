import React from "react";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = "",
}) => {
  return (
    <span
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f3dfa0 65%, #d4af37 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      className={`font-serif tracking-tight ${className}`}
    >
      {children}
    </span>
  );
};

export default GradientText;
