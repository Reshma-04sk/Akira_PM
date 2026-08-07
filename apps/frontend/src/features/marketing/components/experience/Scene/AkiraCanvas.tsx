import React from "react";
import { Canvas } from "@react-three/fiber";
import { Fog } from "../world/Fog";
import { Environment } from "../world/Environment";
import { Lighting } from "../world/Lighting";
import { CameraRig } from "../world/CameraRig";
import { Eclipse } from "../world/Eclipse";
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
        
        {/* Layered Golden Eclipse centerpiece (sits directly behind title) */}
        <Eclipse scrollProgress={scrollProgress} />
        
        {/* 300 Premium calm orbital particles */}
        <Particles scrollProgress={scrollProgress} mouseRef={mouseRef} count={300} />
        
        <CameraRig scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default AkiraCanvas;
