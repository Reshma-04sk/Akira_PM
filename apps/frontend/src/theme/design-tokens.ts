export const theme = {
  colors: {
    background: "#000000",
    surface: "#050505",
    surfaceSecondary: "#0c0c0c",
    glass: "rgba(10, 10, 10, 0.7)",
    gold: "#d4af37",
    goldLight: "#f5d061",
    goldDark: "#ab8836",
    border: "rgba(212, 175, 55, 0.15)",
    borderMuted: "rgba(255, 255, 255, 0.06)",
    text: "#ffffff",
    textMuted: "#a3a3a3",
    destructive: "#e11d48",
    success: "#10b981",
  },
  shadows: {
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
    glow: "0 0 20px rgba(212, 175, 55, 0.15)",
    glowLight: "0 0 10px rgba(212, 175, 55, 0.08)",
    premium: "0 10px 30px rgba(0, 0, 0, 0.5)",
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem",  // 8px
    md: "1rem",    // 16px
    lg: "1.5rem",  // 24px
    xl: "2rem",    // 32px
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    letterSpacing: "-0.02em",
    lineHeight: "1.6",
  },
  motion: {
    spring: { type: "spring", damping: 25, stiffness: 200 },
    springDamp: { type: "spring", damping: 30, stiffness: 300 },
    transitionFast: { duration: 0.15, ease: "easeInOut" },
    transitionNormal: { duration: 0.25, ease: "easeInOut" },
  }
};
