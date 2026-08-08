import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingObjectsProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  scrollProgress: React.MutableRefObject<number>;
}

export const FloatingObjects: React.FC<FloatingObjectsProps> = ({ mouseRef, scrollProgress }) => {
  const meshRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  // Random base coordinate offsets for the 3 premium shapes
  const config = useMemo(() => [
    {
      type: "capsule" as const,
      pos: [-3.2, 1.8, 1.2] as [number, number, number],
      rotSpeed: [0.2, 0.4, 0.1] as [number, number, number],
      scale: 0.15,
      zDepth: 1.2,
    },
    {
      type: "node" as const,
      pos: [3.4, -1.6, -0.8] as [number, number, number],
      rotSpeed: [0.1, 0.2, 0.4] as [number, number, number],
      scale: 0.08,
      zDepth: -0.8,
    },
    {
      type: "shard" as const,
      pos: [2.8, 2.2, 0.5] as [number, number, number],
      rotSpeed: [0.3, 0.1, 0.2] as [number, number, number],
      scale: 0.12,
      zDepth: 0.5,
    },
  ], []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const scroll = scrollProgress.current;

    // The objects should only materialize/fade-in along with the workspace
    // Workspace starts materializing at scroll = 0.45
    const visibilityFactor = THREE.MathUtils.clamp((scroll - 0.40) / 0.15, 0.0, 1.0);

    meshRefs.forEach((ref, index) => {
      if (!ref.current) return;
      const cfg = config[index];

      // Slow float wobble (Brownian vertical/horizontal drift)
      const wobbleX = Math.sin(t * 0.45 + index * 10) * 0.12;
      const wobbleY = Math.cos(t * 0.55 + index * 8) * 0.12;
      
      // Mouse parallax: different depth planes create beautiful parallax offsets
      const parallaxFactor = cfg.zDepth > 0 ? 0.38 : 0.18;
      const px = cfg.pos[0] + wobbleX + mx * parallaxFactor;
      const py = cfg.pos[1] + wobbleY + my * parallaxFactor - scroll * 1.5;
      const pz = cfg.pos[2];

      ref.current.position.set(px, py, pz);

      // Rotate slowly in place
      ref.current.rotation.x = t * cfg.rotSpeed[0];
      ref.current.rotation.y = t * cfg.rotSpeed[1];
      ref.current.rotation.z = t * cfg.rotSpeed[2];

      // Dynamic scaling: scale up as they fade in
      ref.current.scale.setScalar(cfg.scale * visibilityFactor);

      // Interpolate opacity on material
      const material = ref.current.material as THREE.Material;
      if (material) {
        material.transparent = true;
        material.opacity = visibilityFactor * (index === 1 ? 0.95 : 0.45);
      }
    });
  });

  return (
    <group>
      {/* 1. Glass Capsule Shape */}
      <mesh ref={meshRefs[0]}>
        <capsuleGeometry args={[0.6, 1.2, 8, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          transmission={0.95}
          thickness={0.8}
          ior={1.45}
          clearcoat={1.0}
        />
      </mesh>

      {/* 2. Gold Precision Data Node */}
      <mesh ref={meshRefs[1]}>
        <octahedronGeometry args={[1.0, 0]} />
        <meshStandardMaterial
          color="#cba358"
          metalness={1.0}
          roughness={0.24}
        />
      </mesh>

      {/* 3. Translucent Crystal Shard */}
      <mesh ref={meshRefs[2]}>
        <coneGeometry args={[0.5, 1.8, 4]} />
        <meshPhysicalMaterial
          color="#ffdf94"
          roughness={0.08}
          transmission={0.88}
          thickness={0.6}
          ior={1.35}
        />
      </mesh>
    </group>
  );
};

export default FloatingObjects;
