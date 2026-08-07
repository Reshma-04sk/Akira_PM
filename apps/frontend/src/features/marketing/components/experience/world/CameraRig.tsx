import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface CameraRigProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const CameraRig: React.FC<CameraRigProps> = ({ scrollProgress, mouseRef }) => {
  const currentPos = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();

  useFrame((state) => {
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const t = state.clock.getElapsedTime();

    // Get interpolated target vectors from ScrollTimeline
    const timeline = getTimelineState(scroll);

    // 1. Handheld cinematic breathing (subtle noise)
    const breathX = Math.sin(t * 0.4) * 0.035;
    const breathY = Math.cos(t * 0.5) * 0.035;
    const breathZ = Math.sin(t * 0.3) * 0.02;

    // 2. Mouse Parallax shift
    const parallaxX = mx * 0.45;
    const parallaxY = -my * 0.35;

    // Calculate final target positions
    const targetPos = timeline.cameraPos.clone().add(
      new THREE.Vector3(parallaxX + breathX, parallaxY + breathY, breathZ)
    );
    const targetLookAt = timeline.cameraLookAt.clone().add(
      new THREE.Vector3(parallaxX * 0.5, parallaxY * 0.5, 0)
    );

    // 3. Smooth dampening (lerp) toward target
    currentPos.lerp(targetPos, 0.05);
    currentLookAt.lerp(targetLookAt, 0.05);

    // Apply to ThreeJS Camera
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(currentPos);
    cam.lookAt(currentLookAt);

    // Adjust lens field of view (FOV)
    if (cam.fov !== undefined && Math.abs(cam.fov - timeline.cameraFov) > 0.01) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, timeline.cameraFov, 0.05);
      cam.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
