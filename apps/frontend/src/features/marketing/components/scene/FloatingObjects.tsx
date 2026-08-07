import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FloatingObjectsProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const FloatingObjects: React.FC<FloatingObjectsProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  const capsuleRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const secondaryTorusRef = useRef<THREE.Mesh>(null);
  const shard1Ref = useRef<THREE.Mesh>(null);
  const shard2Ref = useRef<THREE.Mesh>(null);
  const shard3Ref = useRef<THREE.Mesh>(null);
  const shard4Ref = useRef<THREE.Mesh>(null);

  const goldMat = {
    color: "#d4af37" as THREE.ColorRepresentation,
    metalness: 1.0,
    roughness: 0.18,
    emissive: "#403008" as THREE.ColorRepresentation,
    emissiveIntensity: 0.4,
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const parallax = { x: mx * 0.5, y: my * 0.3 };

    // Reposition clamping range (keeps them within camera viewport bounds)
    // Left edge ~ -5, Right edge ~ 5, Top edge ~ 3, Bottom edge ~ -3
    
    // 1. Glass Capsule (Left side)
    if (capsuleRef.current) {
      capsuleRef.current.rotation.y = t * 0.15;
      capsuleRef.current.rotation.x = t * 0.05;
      
      const baseX = -2.6 + parallax.x - scroll * 1.5;
      const baseY = -0.5 + Math.sin(t * 0.6) * 0.2 - scroll * 2.5;
      
      // Auto-reposition / Clamp
      capsuleRef.current.position.x = Math.max(-5.0, Math.min(-1.2, baseX));
      capsuleRef.current.position.y = Math.max(-4.0, Math.min(3.0, baseY));
    }

    // 2. Metallic Gold Sphere (Right side)
    if (sphereRef.current) {
      sphereRef.current.rotation.y = -t * 0.12;
      sphereRef.current.rotation.z = t * 0.08;
      
      const baseX = 2.8 + parallax.x * 0.8 + scroll * 1.0;
      const baseY = 0.8 + Math.cos(t * 0.5) * 0.15 - scroll * 2.0;
      
      sphereRef.current.position.x = Math.max(1.2, Math.min(5.0, baseX));
      sphereRef.current.position.y = Math.max(-4.0, Math.min(3.0, baseY));
    }

    // 3. Secondary Torus (Center background)
    if (secondaryTorusRef.current) {
      secondaryTorusRef.current.rotation.y = t * 0.22;
      secondaryTorusRef.current.rotation.x = t * 0.15;
      
      const baseX = 0.5 + parallax.x * 0.5;
      const baseY = -1.8 + Math.sin(t * 0.4) * 0.25 - scroll * 1.8;
      
      secondaryTorusRef.current.position.x = Math.max(-3.0, Math.min(3.0, baseX));
      secondaryTorusRef.current.position.y = Math.max(-4.0, Math.min(2.5, baseY));
    }

    // 4. Shards (Repositioned if drifting out)
    if (shard1Ref.current) {
      shard1Ref.current.rotation.x = t * 0.25;
      shard1Ref.current.rotation.z = t * 0.15;
      const yPos = 2.0 + Math.cos(t * 0.7) * 0.15 - scroll * 3.0;
      shard1Ref.current.position.set(-3.8 + parallax.x, Math.max(-4, yPos), -1.5);
    }

    if (shard2Ref.current) {
      shard2Ref.current.rotation.y = t * 0.3;
      shard2Ref.current.rotation.x = t * 0.1;
      const yPos = -1.5 + Math.sin(t * 0.5) * 0.12 - scroll * 2.0;
      shard2Ref.current.position.set(3.4 + parallax.x * 0.5, Math.max(-4, yPos), -0.5);
    }

    if (shard3Ref.current) {
      shard3Ref.current.rotation.z = -t * 0.18;
      shard3Ref.current.rotation.y = t * 0.2;
      const yPos = 2.4 + Math.cos(t * 0.45) * 0.18 - scroll * 3.2;
      shard3Ref.current.position.set(1.2 + parallax.x * 0.3, Math.max(-4, yPos), -2.2);
    }

    if (shard4Ref.current) {
      shard4Ref.current.rotation.x = -t * 0.22;
      shard4Ref.current.rotation.y = -t * 0.15;
      const yPos = -2.8 + Math.sin(t * 0.6) * 0.25 - scroll * 1.5;
      shard4Ref.current.position.set(-1.8 + parallax.x * 0.6, Math.max(-4, yPos), -1.8);
    }
  });

  return (
    <>
      {/* 1. Glass Capsule */}
      <Float speed={0.9} floatIntensity={0.22}>
        <mesh ref={capsuleRef}>
          <capsuleGeometry args={[0.55, 1.6, 8, 24]} />
          <MeshTransmissionMaterial
            backside={true}
            transmission={0.95}
            thickness={0.8}
            roughness={0.06}
            color="#fff6e0"
            samples={2}
            chromaticAberration={0.03}
            anisotropy={0.5}
            distortion={0.1}
          />
        </mesh>
      </Float>

      {/* 2. Gold Metallic Sphere */}
      <Float speed={0.7} floatIntensity={0.18}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial {...goldMat} roughness={0.12} />
        </mesh>
      </Float>

      {/* 3. Secondary Floating Torus (New requirement) */}
      <Float speed={1.1} floatIntensity={0.3}>
        <mesh ref={secondaryTorusRef} scale={0.7}>
          <torusGeometry args={[1.0, 0.25, 16, 48]} />
          <meshStandardMaterial
            color="#d9c48a"
            metalness={0.9}
            roughness={0.22}
            transparent
            opacity={0.85}
            emissive="#3a2b06"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>

      {/* 4. Crystalline Shards */}
      <mesh ref={shard1Ref}>
        <tetrahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial {...goldMat} roughness={0.1} />
      </mesh>

      <mesh ref={shard2Ref}>
        <coneGeometry args={[0.18, 0.45, 4]} />
        <meshStandardMaterial {...goldMat} roughness={0.08} />
      </mesh>

      <mesh ref={shard3Ref}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial {...goldMat} roughness={0.05} />
      </mesh>

      <mesh ref={shard4Ref}>
        <dodecahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#ffe9a0"
          metalness={0.8}
          roughness={0.1}
          emissive="#d4af37"
          emissiveIntensity={0.3}
        />
      </mesh>
    </>
  );
};
