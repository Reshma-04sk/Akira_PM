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
        // Premium editorial silver gradient (soft white -> slate gray -> cool silver)
        background: "linear-gradient(180deg, #f4f7fa 0%, #cbd5e1 55%, #8b95a5 100%)",
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
