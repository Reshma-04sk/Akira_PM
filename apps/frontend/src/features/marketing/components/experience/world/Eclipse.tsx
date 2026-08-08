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

    // 1. Premium 9-second breathing animation (range: 1.000 to 1.012 relative to base)
    // baseScale = 0.74 (sit comfortably behind title framing it perfectly)
    const baseScale = 0.74;
    const breathingFactor = baseScale * (1.006 + 0.006 * Math.sin(t * (Math.PI * 2 / 9.0)));
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathingFactor);
      
      // 2. Almost imperceptible slow luxury watch rotation
      groupRef.current.rotation.y = t * 0.005;
      groupRef.current.rotation.z = t * 0.002;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.004;
    }
  });

  // Layer 1 Bezel Material: Machined gold with zero emissive glow to catch direct studio spotlights
  const metallicGoldMaterial = (
    <meshStandardMaterial
      color="#cba358" // Executive champagne gold
      metalness={1.0}
      roughness={0.26}
    />
  );

  // Layer 2 Precision Ring Material: Polished thin champagne ring
  const polishedChampagneMaterial = (
    <meshStandardMaterial
      color="#f7ead2" // Champagne white specular shine
      metalness={1.0}
      roughness={0.20}
    />
  );

  // Layer 3 Atmospheric Halo Material: Extremely subtle backward shadow backing
  const subtleHaloMaterial = (
    <meshBasicMaterial
      color="#d4af37"
      transparent
      opacity={0.04} // Lowered to 4% opacity to remain barely noticeable
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

      {/* Layer 2 — Inner Precision Ring (Extremely thin champagne ring detail, pushed slightly forward) */}
      <mesh ref={precisionRingRef} position={[0, 0, 0.03]}>
        <torusGeometry args={[2.04, 0.007, 16, 96]} />
        {polishedChampagneMaterial}
      </mesh>

      {/* Layer 3 — Atmospheric Halo (Subtle soft backing glow disk, positioned outside center view) */}
      <mesh ref={haloRef} position={[0, 0, -0.06]}>
        <ringGeometry args={[2.3, 2.6, 64]} />
        {subtleHaloMaterial}
      </mesh>
    </group>
  );
};

export default Eclipse;
