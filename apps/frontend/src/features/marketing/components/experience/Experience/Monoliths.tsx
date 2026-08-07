import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface MonolithsProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const Monoliths: React.FC<MonolithsProps> = ({ scrollProgress, mouseRef }) => {
  const monolithsGroup = useRef<THREE.Group>(null);
  const capsule1Ref = useRef<THREE.Mesh>(null);
  const capsule2Ref = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  const goldMat = {
    color: "#d4af37" as THREE.ColorRepresentation,
    metalness: 1.0,
    roughness: 0.18,
    emissive: "#403008" as THREE.ColorRepresentation,
    emissiveIntensity: 0.35,
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const parallax = { x: mx * 0.4, y: my * 0.25 };

    // Slide/fade monoliths group vertically on scroll
    // Appears at Ch 3 (Creation/Assembly)
    if (monolithsGroup.current) {
      monolithsGroup.current.position.y = -scroll * 2.5;
      monolithsGroup.current.rotation.y = t * 0.08 + mx * 0.1;
    }

    // 1. Glass Capsule (Tasks indicator)
    if (capsule1Ref.current) {
      capsule1Ref.current.rotation.y = t * 0.18;
      const baseX = -2.8 + parallax.x - scroll * 1.5;
      const baseY = -0.5 + Math.sin(t * 0.5) * 0.2 - scroll * 2.0;
      capsule1Ref.current.position.set(
        Math.max(-5.0, Math.min(-1.2, baseX)),
        Math.max(-4.0, Math.min(3.0, baseY)),
        -0.5
      );
    }

    // 2. Secondary Glass Capsule (Tasks indicator)
    if (capsule2Ref.current) {
      capsule2Ref.current.rotation.x = t * 0.15;
      const baseX = -1.4 + parallax.x * 0.7;
      const baseY = 1.6 + Math.cos(t * 0.45) * 0.15 - scroll * 1.8;
      capsule2Ref.current.position.set(
        Math.max(-4.0, Math.min(1.0, baseX)),
        Math.max(-3.5, Math.min(3.5, baseY)),
        -1.2
      );
    }

    // 3. Metallic gold sphere (Core visual)
    if (sphereRef.current) {
      sphereRef.current.rotation.y = -t * 0.1;
      const baseX = 2.8 + parallax.x * 0.8 + scroll * 1.0;
      const baseY = 0.8 + Math.cos(t * 0.5) * 0.15 - scroll * 2.0;
      sphereRef.current.position.set(
        Math.max(1.2, Math.min(5.0, baseX)),
        Math.max(-4.0, Math.min(3.0, baseY)),
        -0.8
      );
    }
  });

  return (
    <group>
      {/* Structural Glass Monolith Panel (Creation/Assembly reveal) */}
      <group ref={monolithsGroup}>
        <mesh position={[-0.8, -1.2, -2.5]} rotation={[0.1, 0.4, 0]}>
          <boxGeometry args={[1.5, 3.8, 0.15]} />
          <MeshTransmissionMaterial
            backside={true}
            transmission={0.96}
            thickness={1.1}
            roughness={0.05}
            color="#fff6e0"
            samples={2}
          />
        </mesh>
        <mesh position={[1.4, -0.6, -2.2]} rotation={[-0.05, -0.3, 0.05]}>
          <boxGeometry args={[1.2, 3.0, 0.12]} />
          <MeshTransmissionMaterial
            backside={true}
            transmission={0.96}
            thickness={1.0}
            roughness={0.06}
            color="#ffe2a3"
            samples={2}
          />
        </mesh>
      </group>

      {/* Floating capsule 1 */}
      <Float speed={0.9} floatIntensity={0.2}>
        <mesh ref={capsule1Ref}>
          <capsuleGeometry args={[0.5, 1.5, 8, 24]} />
          <MeshTransmissionMaterial
            backside={false}
            transmission={0.92}
            thickness={0.7}
            roughness={0.08}
            color="#fff6e0"
            samples={1}
            chromaticAberration={0.03}
          />
        </mesh>
      </Float>

      {/* Floating capsule 2 */}
      <Float speed={1.1} floatIntensity={0.25}>
        <mesh ref={capsule2Ref}>
          <capsuleGeometry args={[0.3, 1.0, 8, 20]} />
          <MeshTransmissionMaterial
            backside={false}
            transmission={0.9}
            thickness={0.6}
            roughness={0.1}
            color="#ffe2a3"
            samples={1}
          />
        </mesh>
      </Float>

      {/* Floating Gold Sphere */}
      <Float speed={0.7} floatIntensity={0.15}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial {...goldMat} roughness={0.15} />
        </mesh>
      </Float>
    </group>
  );
};

export default Monoliths;
