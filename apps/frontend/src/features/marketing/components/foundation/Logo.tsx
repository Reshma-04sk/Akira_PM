import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`group ${className}`}
    >
      <defs>
        {/* Smoked graphite gradients */}
        <linearGradient id="mLogoObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#0B0B0B" />
        </linearGradient>

        <linearGradient id="mLogoBevel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#404040" />
          <stop offset="100%" stopColor="#1C1C1C" />
        </linearGradient>

        {/* Clean monochrome silver to white gradients */}
        <linearGradient id="mLogoSilver" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#707070" />
          <stop offset="100%" stopColor="#A3A3A3" />
        </linearGradient>

        {/* Active hover accent gradient (clean high-end white highlight) */}
        <linearGradient id="mLogoWhite" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3A3A3" />
          <stop offset="50%" stopColor="#F5F5F3" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Soft Drop Shadows */}
        <filter id="mLogoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#mLogoShadow)" className="transition-all duration-300">
        {/* LEFT LEG (Slate base slant) */}
        <path
          d="M21 82 L48 30 L51 30 L27 82 Z"
          fill="url(#mLogoObsidian)"
          stroke="url(#mLogoBevel)"
          strokeWidth="0.5"
        />

        {/* LEFT LEG INTERNAL FOLD (Silver highlight, hovers to white) */}
        <path
          d="M45 42 L52 30 L54 35 L48 50 Z"
          fill="url(#mLogoSilver)"
          className="group-hover:fill-[url(#mLogoWhite)] transition-all duration-300"
        />

        {/* RIGHT LEG (Slate background slant) */}
        <path
          d="M55 64 L71 82 L62 82 L51 71 Z"
          fill="url(#mLogoObsidian)"
          stroke="url(#mLogoBevel)"
          strokeWidth="0.5"
        />

        {/* BOTTOM MIDDLE SUPPORT */}
        <path
          d="M34 82 L42 82 L50 70 L42 70 Z"
          fill="url(#mLogoObsidian)"
          stroke="url(#mLogoBevel)"
          strokeWidth="0.5"
        />

        {/* MAIN DYNAMIC SILVER ARROW (Crosses and shoots up, hovers to white) */}
        <path
          d="M22 80 
             C24 74, 30 65, 38 60 
             L56 52 
             L75 22
             L79 26
             L58 57
             C48 62, 40 70, 31 82 
             Z"
          fill="url(#mLogoSilver)"
          className="group-hover:fill-[url(#mLogoWhite)] transition-all duration-300"
        />

        {/* The Arrow Head */}
        <path
          d="M66 33 L79 19 L75 39 L72 32 Z"
          fill="url(#mLogoSilver)"
          className="group-hover:fill-[url(#mLogoWhite)] transition-all duration-300"
        />
      </g>
    </svg>
  );
};

export default Logo;
