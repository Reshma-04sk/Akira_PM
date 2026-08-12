import React from "react";

export const AtmosphereBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-[#030303] select-none">
      {/* 1. Base radial gradient + dark canvas background */}
      <div 
        style={{
          background: "radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.025), transparent 45%), #030303"
        }}
        className="absolute inset-0 w-full h-full"
      />

      {/* 2. Fixed vignette - subtle darkening towards the edges */}
      <div 
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%)"
        }}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
      />

      {/* 3. Extremely subtle film grain (opacity 0.025) */}
      <div className="m-grain-overlay opacity-[0.025]" />
    </div>
  );
};

export default AtmosphereBackground;
