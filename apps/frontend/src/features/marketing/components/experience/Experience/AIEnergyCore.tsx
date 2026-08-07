import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface AIEnergyCoreProps {
  scrollProgress: React.MutableRefObject<number>;
}

export const AIEnergyCore: React.FC<AIEnergyCoreProps> = ({ scrollProgress }) => {
  const outerCoreRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;

    const timeline = getTimelineState(scroll);
    const pulse = timeline.corePulse;

    // Standard slow rotations
    if (outerCoreRef.current) {
      outerCoreRef.current.rotation.y = t * 0.15;
      outerCoreRef.current.rotation.x = t * 0.08;
      // Pulse scale
      outerCoreRef.current.scale.setScalar(0.7 + Math.sin(t * 2.0) * 0.05 * pulse);
      (outerCoreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 1.5;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = -t * 0.25;
      innerCoreRef.current.scale.setScalar(0.35 + Math.cos(t * 3.0) * 0.04 * pulse);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.y = t * 0.4;
      ring1Ref.current.scale.setScalar(1.05);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.35;
      ring2Ref.current.scale.setScalar(1.08);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer energy wireframe sphere */}
      <mesh ref={outerCoreRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#d4af37"
          wireframe
          transparent
          opacity={0.7}
          emissive="#ffe9a0"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Solid inner energy seed */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial
          color="#ffe9a0"
          metalness={1.0}
          roughness={0.1}
          emissive="#ffbf3f"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Orbiting ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.9, 0.015, 8, 48]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting ring 2 */}
      <mesh ref={ring2Ref} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.92, 0.012, 8, 48]} />
        <meshStandardMaterial
          color="#ffe9a0"
          metalness={1.0}
          roughness={0.08}
        />
      </mesh>
    </group>
  );
};

export default AIEnergyCore;
