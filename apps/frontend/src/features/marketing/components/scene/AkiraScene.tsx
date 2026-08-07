import React from "react";
import { Canvas } from "@react-three/fiber";
import { EclipseRing } from "./EclipseRing";
import { FloatingObjects } from "./FloatingObjects";
import { ParticleField } from "./ParticleField";

interface AkiraSceneProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const AkiraScene: React.FC<AkiraSceneProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[#07060a]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.5} color="#1a1408" />
        <directionalLight position={[4, 8, 6]} intensity={1.6} color="#ffcf7a" />
        <pointLight position={[-4, 2, 5]} intensity={1.2} distance={25} color="#fff6e6" />
        <pointLight position={[5, -3, -5]} intensity={0.8} distance={20} color="#d4af37" />

        <EclipseRing scrollProgress={scrollProgress} mouseRef={mouseRef} />
        <FloatingObjects scrollProgress={scrollProgress} mouseRef={mouseRef} />
        <ParticleField count={180} scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};
