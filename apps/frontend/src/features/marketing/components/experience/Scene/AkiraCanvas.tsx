import React from "react";
import { Canvas } from "@react-three/fiber";
import { Fog } from "../world/Fog";
import { Environment } from "../world/Environment";
import { Lighting } from "../world/Lighting";
import { CameraRig } from "../world/CameraRig";

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
        
        {/* Simple golden reference sphere for Phase 1 testing */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={1.0}
            roughness={0.15}
            emissive="#3a2b06"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <CameraRig scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default AkiraCanvas;
