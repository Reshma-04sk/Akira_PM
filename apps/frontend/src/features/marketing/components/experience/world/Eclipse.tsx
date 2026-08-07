import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface EclipseProps {
  scrollProgress: React.MutableRefObject<number>;
}

export const Eclipse: React.FC<EclipseProps> = ({ scrollProgress }) => {
  const leftGroupRef = useRef<THREE.Group>(null);
  const rightGroupRef = useRef<THREE.Group>(null);
  const outerLeftRef = useRef<THREE.Mesh>(null);
  const outerRightRef = useRef<THREE.Mesh>(null);
  const innerLeftRef = useRef<THREE.Mesh>(null);
  const innerRightRef = useRef<THREE.Mesh>(null);
  const haloLeftRef = useRef<THREE.Mesh>(null);
  const rightHaloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;

    // Get timeline properties
    const timeline = getTimelineState(scroll);

    // splitOffset ranges from 0 to 1
    // We map it to translation X offsets: 0 -> 5.0
    const xOffset = timeline.splitOffset * 5.0;

    // Scale logic
    const baseScale = 1.15 + Math.sin(t * 0.4) * 0.015;
    // Shrinks slightly when fully split, grows during final CTA
    const ctaProgress = Math.max((scroll - 0.9) / 0.1, 0);
    const scale = baseScale * (1 - timeline.splitOffset * 0.15 + ctaProgress * 0.4);

    if (leftGroupRef.current) {
      leftGroupRef.current.position.x = -xOffset;
      leftGroupRef.current.scale.setScalar(scale);
      leftGroupRef.current.rotation.y = t * 0.04;
      leftGroupRef.current.rotation.z = t * 0.02;
    }

    if (rightGroupRef.current) {
      rightGroupRef.current.position.x = xOffset;
      rightGroupRef.current.scale.setScalar(scale);
      rightGroupRef.current.rotation.y = -t * 0.04;
      rightGroupRef.current.rotation.z = -t * 0.02;
    }
  });

  const goldMat = (
    <meshStandardMaterial
      color="#d4af37"
      metalness={1.0}
      roughness={0.15}
      emissive="#403008"
      emissiveIntensity={0.5}
    />
  );

  const goldThinMat = (
    <meshStandardMaterial
      color="#ffe9a0"
      metalness={1.0}
      roughness={0.08}
      emissive="#ffe9a0"
      emissiveIntensity={0.6}
    />
  );

  const haloMat = (
    <meshBasicMaterial
      color="#d4af37"
      transparent
      opacity={0.2}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group>
      {/* LEFT HALF OF THE ECLIPSE */}
      <group ref={leftGroupRef}>
        <mesh ref={outerLeftRef} rotation-z={Math.PI / 2}>
          <torusGeometry args={[2.4, 0.07, 16, 64, Math.PI]} />
          {goldMat}
        </mesh>
        <mesh ref={innerLeftRef} rotation-z={Math.PI / 2}>
          <torusGeometry args={[2.4, 0.025, 8, 64, Math.PI]} />
          {goldThinMat}
        </mesh>
        <mesh ref={haloLeftRef} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2}>
          <ringGeometry args={[2.0, 3.2, 32, 1, 0, Math.PI]} />
          {haloMat}
        </mesh>
      </group>

      {/* RIGHT HALF OF THE ECLIPSE */}
      <group ref={rightGroupRef}>
        <mesh ref={outerRightRef} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[2.4, 0.07, 16, 64, Math.PI]} />
          {goldMat}
        </mesh>
        <mesh ref={innerRightRef} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[2.4, 0.025, 8, 64, Math.PI]} />
          {goldThinMat}
        </mesh>
        <mesh ref={rightHaloRef} rotation-x={-Math.PI / 2} rotation-z={-Math.PI / 2}>
          <ringGeometry args={[2.0, 3.2, 32, 1, 0, Math.PI]} />
          {haloMat}
        </mesh>
      </group>
    </group>
  );
};

export default Eclipse;
