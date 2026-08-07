import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EclipseRingProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const EclipseRing: React.FC<EclipseRingProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  const leftGroupRef = useRef<THREE.Group>(null);
  const rightGroupRef = useRef<THREE.Group>(null);
  const leftInnerRef = useRef<THREE.Mesh>(null);
  const rightInnerRef = useRef<THREE.Mesh>(null);
  const leftOuterRef = useRef<THREE.Mesh>(null);
  const rightOuterRef = useRef<THREE.Mesh>(null);
  const leftHaloRef = useRef<THREE.Mesh>(null);
  const rightHaloRef = useRef<THREE.Mesh>(null);

  // Orbiting shards
  const orbitShards = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    radius: 2.8 + (i % 3) * 0.2,
    speed: 0.05 + (i % 4) * 0.015,
    phase: Math.random() * Math.PI * 2,
  }));
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Split translation offset based on scroll
    // Splits wide open (from x=0 to x=6.0) as scroll goes 0 -> 0.4
    const splitProgress = Math.min(scroll / 0.4, 1);
    const xOffset = splitProgress * 5.0;

    // Scale logic: Starts at 1.15 in hero, grows slightly or bobs
    const baseScale = 1.15 + Math.sin(t * 0.5) * 0.02;
    // Shrinks slightly when fully split, then scales up at final CTA (scroll > 0.9)
    const ctaProgress = Math.max((scroll - 0.9) / 0.1, 0);
    const currentScale = baseScale * (1 - splitProgress * 0.15 + ctaProgress * 0.45);

    // Mouse parallax rotation influence
    const rotX = my * 0.08;
    const rotY = mx * 0.08;

    // Apply translations and rotations to the two halves
    if (leftGroupRef.current) {
      leftGroupRef.current.position.x = -xOffset;
      leftGroupRef.current.scale.setScalar(currentScale);
      leftGroupRef.current.rotation.y = t * 0.05 + rotY;
      leftGroupRef.current.rotation.x = rotX;
      leftGroupRef.current.rotation.z = t * 0.02;
    }

    if (rightGroupRef.current) {
      rightGroupRef.current.position.x = xOffset;
      rightGroupRef.current.scale.setScalar(currentScale);
      rightGroupRef.current.rotation.y = -t * 0.05 - rotY;
      rightGroupRef.current.rotation.x = -rotX;
      rightGroupRef.current.rotation.z = -t * 0.02;
    }

    // Auto-reposition orbit shards if they drift out of camera range
    shardRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const shard = orbitShards[i];
      const a = shard.angle + t * shard.speed;
      
      // Calculate basic orbit position
      let x = Math.cos(a) * shard.radius;
      const y = Math.sin(a) * shard.radius * 0.5 + Math.sin(t + shard.phase) * 0.1;
      const z = Math.sin(a) * shard.radius * 0.3;

      // If split is active, push shards outwards
      x += (x > 0 ? 1 : -1) * xOffset * 0.5;

      mesh.position.set(x, y, z);
      mesh.rotation.y = t * 0.4 + i;
      mesh.rotation.x = t * 0.2;
    });
  });

  const goldMaterial = (
    <meshStandardMaterial
      color="#d4af37"
      metalness={1.0}
      roughness={0.15}
      emissive="#523d0a"
      emissiveIntensity={0.5}
    />
  );

  const goldThinnerMaterial = (
    <meshStandardMaterial
      color="#ffe9a0"
      metalness={1.0}
      roughness={0.08}
      emissive="#ffe9a0"
      emissiveIntensity={0.7}
    />
  );

  const haloMaterial = (
    <meshBasicMaterial
      color="#d4af37"
      transparent
      opacity={0.25}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group>
      {/* LEFT HALF OF THE ECLIPSE RING */}
      <group ref={leftGroupRef}>
        {/* Outer Ring */}
        <mesh ref={leftOuterRef} rotation-z={Math.PI / 2}>
          <torusGeometry args={[2.4, 0.07, 16, 64, Math.PI]} />
          {goldMaterial}
        </mesh>

        {/* Inner Ring */}
        <mesh ref={leftInnerRef} rotation-z={Math.PI / 2}>
          <torusGeometry args={[2.4, 0.025, 8, 64, Math.PI]} />
          {goldThinnerMaterial}
        </mesh>

        {/* Halo Glow */}
        <mesh ref={leftHaloRef} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2}>
          <ringGeometry args={[2.0, 3.2, 32, 1, 0, Math.PI]} />
          {haloMaterial}
        </mesh>
      </group>

      {/* RIGHT HALF OF THE ECLIPSE RING */}
      <group ref={rightGroupRef}>
        {/* Outer Ring */}
        <mesh ref={rightOuterRef} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[2.4, 0.07, 16, 64, Math.PI]} />
          {goldMaterial}
        </mesh>

        {/* Inner Ring */}
        <mesh ref={rightInnerRef} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[2.4, 0.025, 8, 64, Math.PI]} />
          {goldThinnerMaterial}
        </mesh>

        {/* Halo Glow */}
        <mesh ref={rightHaloRef} rotation-x={-Math.PI / 2} rotation-z={-Math.PI / 2}>
          <ringGeometry args={[2.0, 3.2, 32, 1, 0, Math.PI]} />
          {haloMaterial}
        </mesh>
      </group>

      {/* Orbiting Shards */}
      {orbitShards.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
        >
          <octahedronGeometry args={[0.06 + (i % 3) * 0.025, 0]} />
          <meshStandardMaterial
            color="#ffe9a0"
            metalness={1.0}
            roughness={0.1}
            emissive="#d4af37"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};
