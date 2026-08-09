import React from "react";
import { Canvas } from "@react-three/fiber";
import AmbientParticles from "../effects/AmbientParticles";
import ExperienceCamera from "../Camera/ExperienceCamera";

export const AkiraCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8.0], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={1.2} // Clamped DPR for optimal battery/GPU efficiency
        performance={{ min: 0.5 }}
      >
        {/* Instanced background data dust */}
        <AmbientParticles />

        {/* Cinematic camera system */}
        <ExperienceCamera />
      </Canvas>
    </div>
  );
};

export default AkiraCanvas;
