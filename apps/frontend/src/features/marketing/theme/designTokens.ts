/**
 * Monochrome Design Tokens for Akira PM (Phase 1.2 Rebuild)
 * Translates visual design systems into accessible JavaScript constants
 * for R3F, canvas materials, and inline styling.
 */
export const tokens = {
  colors: {
    // Background levels (deep monochrome canvas)
    background0: "#030303",
    background1: "#070707",
    background2: "#0B0B0B",

    // Solid surfaces
    surface1: "#101010",
    surface2: "#151515",
    surface3: "#1B1B1B",
    surfaceElevated: "#202020",
    
    // Premium editorial typography colors
    textPrimary: "#F5F5F3",
    textSecondary: "#A3A3A3",
    textTertiary: "#707070",
    textMuted: "#4F4F4F",
    
    // Core borders (low-opacity white lines)
    borderSubtle: "rgba(255, 255, 255, 0.055)",
    borderDefault: "rgba(255, 255, 255, 0.09)",
    borderStrong: "rgba(255, 255, 255, 0.15)",

    // Glass variables
    glassBg: "rgba(255, 255, 255, 0.035)",
    glassBgHover: "rgba(255, 255, 255, 0.055)",
    glassBorder: "rgba(255, 255, 255, 0.10)"
  },
  
  shadows: {
    subtle: "0 2px 8px rgba(0, 0, 0, 0.3)",
    surface: "0 8px 32px rgba(0, 0, 0, 0.55)",
    elevated: "0 16px 48px rgba(0, 0, 0, 0.7)",
    cinematic: "0 40px 120px rgba(0, 0, 0, 0.45)"
  },
  
  motion: {
    easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeCinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
    durationFast: "150ms",
    durationStandard: "300ms",
    durationSlow: "800ms"
  },
  
  spacing: {
    gutter: "2rem",
    section: "6rem",
    cardPadding: "1rem",
    gridGap: "1rem"
  }
};

export default tokens;
