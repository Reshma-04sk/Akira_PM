import React from "react";

interface AkiraLogoProps {
  className?: string;
  size?: number;
}

export const AkiraLogo: React.FC<AkiraLogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Obsidian Dark Gradients */}
        <linearGradient id="obsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c2b30" />
          <stop offset="50%" stopColor="#1a191c" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </linearGradient>

        <linearGradient id="obsidianBevel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#434148" />
          <stop offset="100%" stopColor="#141316" />
        </linearGradient>

        {/* Champagne Gold Gradients */}
        <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6b1f" />
          <stop offset="30%" stopColor="#d4af37" />
          <stop offset="70%" stopColor="#ffe9a0" />
          <stop offset="100%" stopColor="#ab8836" />
        </linearGradient>

        <linearGradient id="goldLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe9a0" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a6b1f" />
        </linearGradient>

        {/* Soft Drop Shadows */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#d4af37" floodOpacity="0.1" />
        </filter>
      </defs>

      <g filter="url(#logoShadow)">
        {/* LEFT LEG (Obsidian base slant) */}
        <path
          d="M21 82 L48 30 L51 30 L27 82 Z"
          fill="url(#obsidianGrad)"
          stroke="url(#obsidianBevel)"
          strokeWidth="0.5"
        />

        {/* LEFT LEG INTERNAL FOLD (Gold highlight) */}
        <path
          d="M45 42 L52 30 L54 35 L48 50 Z"
          fill="url(#goldGrad)"
        />

        {/* RIGHT LEG (Obsidian background slant) */}
        <path
          d="M55 64 L71 82 L62 82 L51 71 Z"
          fill="url(#obsidianGrad)"
          stroke="url(#obsidianBevel)"
          strokeWidth="0.5"
        />

        {/* BOTTOM MIDDLE GOLD SUPPORT */}
        <path
          d="M34 82 L42 82 L50 70 L42 70 Z"
          fill="url(#goldGrad)"
        />

        {/* MAIN DYNAMIC GOLDEN ARROW (Crosses and shoots up to the right) */}
        {/* The Arrow Ribbon Body */}
        <path
          d="M22 80 
             C24 74, 30 65, 38 60 
             L56 52 
             L75 22
             L79 26
             L58 57
             C48 62, 40 70, 31 82 
             Z"
          fill="url(#goldGrad)"
        />

        {/* The Arrow Head */}
        <path
          d="M66 33 L79 19 L75 39 L72 32 Z"
          fill="url(#goldLightGrad)"
        />

        {/* Highlight Ridge along the center of the arrow */}
        <path
          d="M22 80 C32 68, 48 58, 57 54 L76 23"
          stroke="#ffe9a0"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default AkiraLogo;
