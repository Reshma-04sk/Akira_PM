import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "../hooks/ExperienceContext";

export const ExperienceCamera: React.FC = () => {
  const { scrollProgressRef, mouseRef, prefersReducedMotion } = useExperience();
  
  const currentPos = useRef(new THREE.Vector3(0, 0, 8.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    if (!cam) return;

    // If accessibility reduced motion is enabled, snap to static coordinates
    if (prefersReducedMotion) {
      cam.position.set(0, 0, 8.0);
      cam.lookAt(0, 0, 0);
      return;
    }

    const scroll = scrollProgressRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const t = state.clock.getElapsedTime();

    // 1. Premium slow camera dolly trajectory: position [0, 0, 8.0] to [0, 0.12, 7.2]
    const targetZ = THREE.MathUtils.lerp(8.0, 7.2, scroll);
    const targetY = THREE.MathUtils.lerp(0.0, 0.12, scroll);

    // 2. Slow subconscious idle camera breathing
    const breathX = Math.sin(t * 0.15) * 0.008;
    const breathY = Math.cos(t * 0.12) * 0.008;

    // 3. Subtle mouse parallax: strictly <= 1% coordinate Pan displacement
    const parallaxX = mx * 0.08;
    const parallaxY = -my * 0.06;

    const targetPos = new THREE.Vector3(
      parallaxX + breathX,
      targetY + parallaxY + breathY,
      targetZ
    );

    const targetLookAt = new THREE.Vector3(
      parallaxX * 0.3,
      targetY + parallaxY * 0.3,
      0
    );

    // Heavy-momentum fluid camera transition (damping factor 0.035)
    currentPos.current.lerp(targetPos, 0.035);
    currentLookAt.current.lerp(targetLookAt, 0.035);

    cam.position.copy(currentPos.current);
    cam.lookAt(currentLookAt.current);
  });

  return null;
};

export default ExperienceCamera;
