import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { EclipseRing } from "./EclipseRing";
import { FloatingObjects } from "./FloatingObjects";
import { ParticleField } from "./ParticleField";

interface SceneLightsAndCameraProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

const SceneLightsAndCamera: React.FC<SceneLightsAndCameraProps> = ({ mouseRef }) => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLight1Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Subtle camera parallax shift based on cursor
    state.camera.position.x += (mx * 0.8 - state.camera.position.x) * 0.04;
    state.camera.position.y += (-my * 0.6 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);

    // Subtle light source shift to animate highlights
    if (dirLightRef.current) {
      dirLightRef.current.position.x = 4 + mx * 2.0;
      dirLightRef.current.position.y = 8 - my * 2.0;
    }
    if (pointLight1Ref.current) {
      pointLight1Ref.current.position.x = -4 - mx * 1.5;
    }
  });

  return (
    <>
      {/* Warm Volumetric Lights and cool rim light */}
      <ambientLight intensity={0.9} color="#1d160b" />
      
      {/* Key gold directional light */}
      <directionalLight
        ref={dirLightRef}
        position={[4, 8, 6]}
        intensity={2.8}
        color="#ffe2a3"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Cool rim/ambient helper lights */}
      <pointLight
        ref={pointLight1Ref}
        position={[-4, 2, 5]}
        intensity={1.8}
        distance={25}
        color="#fff5e6"
      />
      
      <pointLight
        position={[5, -4, -5]}
        intensity={1.5}
        distance={20}
        color="#d4af37"
      />
    </>
  );
};

interface AkiraSceneProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const AkiraScene: React.FC<AkiraSceneProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 42 }}
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
        {/* Volumetric Fog */}
        <fog attach="fog" args={["#07060a", 5.0, 18.0]} />
        
        {/* HDR Environment preset for premium reflections */}
        <Environment preset="sunset" />
        
        <SceneLightsAndCamera mouseRef={mouseRef} />
        
        <EclipseRing scrollProgress={scrollProgress} mouseRef={mouseRef} />
        <FloatingObjects scrollProgress={scrollProgress} mouseRef={mouseRef} />
        <ParticleField count={1100} scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default AkiraScene;
