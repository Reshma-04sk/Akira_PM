import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface EclipseProps {
  scrollProgress: React.MutableRefObject<number>;
}

export const Eclipse: React.FC<EclipseProps> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftGroupRef = useRef<THREE.Group>(null);
  const rightGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;

    // Retrieve interpolated timeline keyframe values
    const timeline = getTimelineState(scroll);
    const splitOffset = timeline.splitOffset;

    // 1. Base breathing cycle (dampens when split opens)
    const baseScale = 0.74;
    const breathingFactor = baseScale * (1.006 + 0.006 * Math.sin(t * (Math.PI * 2 / 9.0)) * (1.0 - splitOffset));
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathingFactor);

      // 2. Transition from hero flat breathe to a premium orbital architectural incline
      if (splitOffset > 0.15) {
        // Slow incline tilt (approx 8 degrees) and slow orbit rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.14, 0.08);
        groupRef.current.rotation.y = t * 0.04;
        groupRef.current.rotation.z = t * 0.015;
      } else {
        // Flat, subtle hero rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.0, 0.08);
        groupRef.current.rotation.y = t * 0.005;
        groupRef.current.rotation.z = t * 0.002;
      }
    }

    // 3. Separate the left and right groups horizontally
    const targetSplitX = 2.8 * splitOffset;
    if (leftGroupRef.current && rightGroupRef.current) {
      // Lerp X offsets to keep motion buttery smooth
      leftGroupRef.current.position.x = THREE.MathUtils.lerp(
        leftGroupRef.current.position.x,
        -targetSplitX,
        0.1
      );
      leftGroupRef.current.position.z = THREE.MathUtils.lerp(
        leftGroupRef.current.position.z,
        -0.2 * splitOffset, // slide back slightly behind workspace
        0.1
      );

      rightGroupRef.current.position.x = THREE.MathUtils.lerp(
        rightGroupRef.current.position.x,
        targetSplitX,
        0.1
      );
      rightGroupRef.current.position.z = THREE.MathUtils.lerp(
        rightGroupRef.current.position.z,
        -0.2 * splitOffset,
        0.1
      );
    }
  });

  const metallicGoldMaterial = (
    <meshStandardMaterial
      color="#cba358" // Watch-grade champagne gold
      metalness={1.0}
      roughness={0.26}
    />
  );

  const polishedChampagneMaterial = (
    <meshStandardMaterial
      color="#f7ead2" // Specular highlight champagne
      metalness={1.0}
      roughness={0.20}
    />
  );

  return (
    <group ref={groupRef}>
      {/* LEFT ARC HALF (Rotated 90deg to cover the left semi-circle) */}
      <group ref={leftGroupRef}>
        {/* Primary Bezel Left Half */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[2.4, 0.085, 32, 64, Math.PI]} />
          {metallicGoldMaterial}
        </mesh>
        {/* Inner Precision Ring Left Half (pushed slightly forward) */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[2.04, 0.007, 16, 48, Math.PI]} />
          {polishedChampagneMaterial}
        </mesh>
      </group>

      {/* RIGHT ARC HALF (Rotated -90deg to cover the right semi-circle) */}
      <group ref={rightGroupRef}>
        {/* Primary Bezel Right Half */}
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[2.4, 0.085, 32, 64, Math.PI]} />
          {metallicGoldMaterial}
        </mesh>
        {/* Inner Precision Ring Right Half (pushed slightly forward) */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[2.04, 0.007, 16, 48, Math.PI]} />
          {polishedChampagneMaterial}
        </mesh>
      </group>
    </group>
  );
};

export default Eclipse;
