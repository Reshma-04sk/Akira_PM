import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EclipseProps {
  scrollProgress: React.MutableRefObject<number>;
}

export const Eclipse: React.FC<EclipseProps> = () => {
  const groupRef = useRef<THREE.Group>(null);
  const outerBezelRef = useRef<THREE.Mesh>(null);
  const outerBevelRef = useRef<THREE.Mesh>(null);
  const innerBevelRef = useRef<THREE.Mesh>(null);
  const champagneCoreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Slow, premium breathing animation (range: 1.00 to 1.02, frequency: 8 seconds)
    // Formula: center = 1.01, amplitude = 0.01
    const breathingFactor = 1.01 + 0.01 * Math.sin(t * (Math.PI * 2 / 8.0));
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathingFactor);
      
      // 2. Very slow, subtle luxury watch-like rotation
      groupRef.current.rotation.y = t * 0.018;
      groupRef.current.rotation.z = t * 0.008;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.02;
    }
  });

  // Brushed gold material configuration (metallic surface, subtle reflections)
  const brushedGoldMaterial = (
    <meshStandardMaterial
      color="#d4af37"
      metalness={1.0}
      roughness={0.24}
      emissive="#2d2105"
      emissiveIntensity={0.35}
    />
  );

  // Highly polished champagne gold ring (bright, thin core)
  const polishedChampagneMaterial = (
    <meshStandardMaterial
      color="#ffe9a0"
      metalness={1.0}
      roughness={0.08}
      emissive="#4d3e1a"
      emissiveIntensity={0.5}
    />
  );

  // Soft, subtle halo basic material
  const subtleHaloMaterial = (
    <meshBasicMaterial
      color="#d4af37"
      transparent
      opacity={0.16}
      side={THREE.DoubleSide}
    />
  );

  return (
    // Single consolidated watch centerpiece group
    <group ref={groupRef}>
      {/* 1. Main Outer Bezel Ring (Thicker Gold Torus) */}
      <mesh ref={outerBezelRef}>
        <torusGeometry args={[2.4, 0.08, 16, 128]} />
        {brushedGoldMaterial}
      </mesh>

      {/* 2. Outer Bevel Rim (Thin Gold Bezel Edge, slightly pushed back) */}
      <mesh ref={outerBevelRef} position={[0, 0, -0.04]}>
        <torusGeometry args={[2.52, 0.02, 12, 128]} />
        {brushedGoldMaterial}
      </mesh>

      {/* 3. Inner Bevel Rim (Thin Gold Ridge, slightly pushed forward) */}
      <mesh ref={innerBevelRef} position={[0, 0, 0.04]}>
        <torusGeometry args={[2.28, 0.02, 12, 128]} />
        {brushedGoldMaterial}
      </mesh>

      {/* 4. Champagne Core Ring (Thinner Polished Torus) */}
      <mesh ref={champagneCoreRef}>
        <torusGeometry args={[1.96, 0.016, 8, 128]} />
        {polishedChampagneMaterial}
      </mesh>

      {/* 5. Soft Glow Bezel Halo (Subtle Ring disk) */}
      <mesh ref={haloRef} position={[0, 0, -0.08]}>
        <ringGeometry args={[1.8, 2.6, 64]} />
        {subtleHaloMaterial}
      </mesh>
    </group>
  );
};

export default Eclipse;
