import React from "react";
import { Canvas } from "@react-three/fiber";
import { Fog } from "../world/Fog";
import { Environment } from "../world/Environment";
import { Lighting } from "../world/Lighting";
import { CameraRig } from "../world/CameraRig";
import { Eclipse } from "../world/Eclipse";
import { Monoliths } from "../Experience/Monoliths";
import { AIEnergyCore } from "../Experience/AIEnergyCore";
import { Particles } from "../effects/Particles";

interface AkiraCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const AkiraCanvas: React.FC<AkiraCanvasProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9.0], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <Fog />
        <Environment />
        <Lighting scrollProgress={scrollProgress} mouseRef={mouseRef} />
        
        {/* Experience Objects */}
        <Eclipse scrollProgress={scrollProgress} />
        <Monoliths scrollProgress={scrollProgress} mouseRef={mouseRef} />
        <AIEnergyCore scrollProgress={scrollProgress} />
        
        {/* Instanced Effects */}
        <Particles scrollProgress={scrollProgress} mouseRef={mouseRef} count={1200} />
        
        {/* Active camera rig */}
        <CameraRig scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default AkiraCanvas;
