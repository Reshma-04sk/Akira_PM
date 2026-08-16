import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthBackground } from "@/features/auth/components/AuthBackground";

export const BlankLayout: React.FC = () => {
  const location = useLocation();

  return (
    // Centered layout wrapper with deep black-graphite atmosphere vignette
    <div 
      style={{
        background: "radial-gradient(circle at center, #0B0B0B 0%, #030303 100%)"
      }}
      className="min-h-screen bg-[#030303] text-[#F5F5F3] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none"
    >
      {/* 1. Volumetric backing halo (subtle, 1.5% opacity white/neutral light) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/0.015 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 2. Interactive mouse ambient glow & theme particles */}
      <AuthBackground />

      {/* 3. Global film grain layer */}
      <div className="m-grain-overlay" />

      {/* 4. Centered page content with smooth page transitions */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <div key={location.pathname} className="w-full flex items-center justify-center">
            <Outlet />
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlankLayout;
