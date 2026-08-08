import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface LightingProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const Lighting: React.FC<LightingProps> = ({ scrollProgress, mouseRef }) => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLight1Ref = useRef<THREE.PointLight>(null);
  const pointLight2Ref = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Get current interpolated colors and intensities from ScrollTimeline
    const state = getTimelineState(scroll);

    // Apply color and intensity to key lights
    if (dirLightRef.current) {
      dirLightRef.current.intensity = state.lightIntensity * 1.2;
      dirLightRef.current.color.copy(state.lightColor);
      
      // Shift position slightly for dynamic key highlight shifts
      dirLightRef.current.position.set(4 + mx * 2.0, 8 - my * 2.0, 6);
    }

    if (pointLight1Ref.current) {
      pointLight1Ref.current.intensity = state.lightIntensity * 0.7;
      pointLight1Ref.current.position.set(-4 - mx * 1.5, 2, 5);
    }

    if (pointLight2Ref.current) {
      // Keep pointLight2 warm/amber color
      pointLight2Ref.current.intensity = state.lightIntensity * 0.5;
      pointLight2Ref.current.position.set(5, -4 - my * 1.5, -5);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} color="#1d160b" />
      
      <directionalLight
        ref={dirLightRef}
        position={[4, 8, 6]}
        intensity={2.5}
      />

      <pointLight
        ref={pointLight1Ref}
        position={[-4, 2, 5]}
        intensity={1.5}
        distance={25}
        color="#fff5e6"
      />

      <pointLight
        ref={pointLight2Ref}
        position={[5, -4, -5]}
        intensity={1.0}
        distance={20}
        color="#d4af37"
      />
    </>
  );
};

export default Lighting;
