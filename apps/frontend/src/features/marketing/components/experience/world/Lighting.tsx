import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface LightingProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const Lighting: React.FC<LightingProps> = ({ scrollProgress, mouseRef }) => {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const state = getTimelineState(scroll);

    // Dynamic interpolation based on timeline and mouse parallax
    if (keyLightRef.current) {
      keyLightRef.current.intensity = state.lightIntensity * 3.0;
      keyLightRef.current.position.set(4 + mx * 1.5, 6 - my * 1.5, 5);
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = state.lightIntensity * 1.4;
      fillLightRef.current.position.set(-5 - mx * 1.0, 2 + my * 1.0, 4);
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = state.lightIntensity * 2.8;
      rimLightRef.current.position.set(0, 3, -6 - my * 2.0);
    }
  });

  return (
    <>
      {/* 1. Warm Ambient Base */}
      <ambientLight intensity={0.65} color="#21180c" />
      
      {/* 2. Golden Key Light (paints main specular golds) */}
      <directionalLight
        ref={keyLightRef}
        position={[4, 6, 5]}
        intensity={3.0}
        color="#ffdf94"
      />

      {/* 3. White Fill Light (brings out bevel structure contours) */}
      <directionalLight
        ref={fillLightRef}
        position={[-5, 2, 4]}
        intensity={1.4}
        color="#ffffff"
      />

      {/* 4. Blue Rim Light (shines from behind for electric blue bevel edges) */}
      <pointLight
        ref={rimLightRef}
        position={[0, 3, -6]}
        intensity={2.8}
        distance={22}
        color="#3b82f6"
      />
    </>
  );
};

export default Lighting;
