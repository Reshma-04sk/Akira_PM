import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface CameraRigProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const CameraRig: React.FC<CameraRigProps> = ({ scrollProgress, mouseRef }) => {
  // Use refs to store camera state and prevent recreation between frames
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 9.0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x; // Ranges -1 to 1
    const my = mouseRef.current.y; // Ranges -1 to 1
    const t = state.clock.getElapsedTime();

    // 1. Get baseline target coordinates from the scroll timeline
    const timeline = getTimelineState(scroll);

    // 2. Heavy cinema camera idle breathing (extremely slow, fluid noise waves)
    const breathX = Math.sin(t * 0.22) * 0.012;
    const breathY = Math.cos(t * 0.18) * 0.012;
    const breathZ = Math.sin(t * 0.14) * 0.008;

    // 3. Tiny orbital pan (subconscious circular drift)
    const orbitX = Math.cos(t * 0.06) * 0.04;
    const orbitY = Math.sin(t * 0.05) * 0.03;

    // 4. Subtle mouse parallax (strictly restricted to <= 3% coordinate shift)
    // At z=9, offset of 0.20 units represents roughly ~2% camera translation offset
    const parallaxX = mx * 0.18;
    const parallaxY = -my * 0.15;

    // 5. Consolidate target vectors
    const targetPos = timeline.cameraPos.clone().add(
      new THREE.Vector3(parallaxX + breathX + orbitX, parallaxY + breathY + orbitY, breathZ)
    );
    const targetLookAt = timeline.cameraLookAt.clone().add(
      new THREE.Vector3(parallaxX * 0.4, parallaxY * 0.4, 0)
    );

    // 6. Hydraulic/Heavy-dolly damping (low lerp value for ultra-smooth momentum)
    currentPosRef.current.lerp(targetPos, 0.025);
    currentLookAtRef.current.lerp(targetLookAt, 0.025);

    // 7. Apply parameters to perspective camera
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(currentPosRef.current);
    cam.lookAt(currentLookAtRef.current);

    // Smoothly update lens field of view (FOV)
    if (cam.fov !== undefined && Math.abs(cam.fov - timeline.cameraFov) > 0.01) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, timeline.cameraFov, 0.025);
      cam.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
