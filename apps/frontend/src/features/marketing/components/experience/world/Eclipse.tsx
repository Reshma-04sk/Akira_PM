import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EclipseProps {
  scrollProgress: React.MutableRefObject<number>;
}

export const Eclipse: React.FC<EclipseProps> = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bezelRef = useRef<THREE.Mesh>(null);
  const precisionRingRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Premium 8-second breathing animation (range: 1.00 to 1.015 relative to base)
    // base scale = 0.86 (sit comfortably behind title without viewport edge collision)
    const baseScale = 0.86;
    const breathingFactor = baseScale * (1.0075 + 0.0075 * Math.sin(t * (Math.PI * 2 / 8.0)));
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathingFactor);
      
      // 2. Almost imperceptible slow luxury watch rotation
      groupRef.current.rotation.y = t * 0.008;
      groupRef.current.rotation.z = t * 0.003;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.005;
    }
  });

  // Layer 1 Bezel Material: Premium metallic gold with zero emissive glow to catch studio highlights
  const metallicGoldMaterial = (
    <meshStandardMaterial
      color="#ccaa5c" // Restrained warm champagne watch gold
      metalness={1.0}
      roughness={0.24}
    />
  );

  // Layer 2 Precision Ring Material: Polished thin champagne ring
  const polishedChampagneMaterial = (
    <meshStandardMaterial
      color="#fcedc7" // Champagne white specular shine
      metalness={1.0}
      roughness={0.12}
    />
  );

  // Layer 3 Atmospheric Halo Material: Extremely subtle backward shadow backing
  const subtleHaloMaterial = (
    <meshBasicMaterial
      color="#d4af37"
      transparent
      opacity={0.06} // Keep opacity very low
      side={THREE.DoubleSide}
    />
  );

  return (
    // Single consolidated watch centerpiece group
    <group ref={groupRef}>
      {/* Layer 1 — Primary Bezel (Thick Metallic Torus, high segments for perfect circle silhouette) */}
      <mesh ref={bezelRef}>
        <torusGeometry args={[2.4, 0.085, 32, 128]} />
        {metallicGoldMaterial}
      </mesh>

      {/* Layer 2 — Inner Precision Ring (Extremely thin champagne ring, pushed slightly forward) */}
      <mesh ref={precisionRingRef} position={[0, 0, 0.04]}>
        <torusGeometry args={[2.05, 0.012, 16, 96]} />
        {polishedChampagneMaterial}
      </mesh>

      {/* Layer 3 — Atmospheric Halo (Subtle soft backing glow disk, pushed backward) */}
      <mesh ref={haloRef} position={[0, 0, -0.06]}>
        <ringGeometry args={[1.8, 2.6, 64]} />
        {subtleHaloMaterial}
      </mesh>
    </group>
  );
};

export default Eclipse;
