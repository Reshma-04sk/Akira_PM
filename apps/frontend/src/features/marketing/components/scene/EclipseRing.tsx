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
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const orbitGroup = useRef<THREE.Group>(null);

  const orbitShards = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    radius: 2.6 + (i % 3) * 0.15,
    speed: 0.08 + (i % 4) * 0.02,
  }));

  const orbitRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Eclipse scale driven by scroll: tiny → full → huge at CTA
    const chapterProgress = Math.min(scroll / 0.15, 1);
    const ctaProgress = Math.max((scroll - 0.93) / 0.07, 0);
    const scale = 0.08 + chapterProgress * 1.15 + ctaProgress * 0.3;

    if (outerRef.current) {
      outerRef.current.scale.setScalar(scale);
      outerRef.current.rotation.z = t * 0.06 + mx * 0.15;
      outerRef.current.rotation.x = t * 0.03 + my * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(scale * 0.85);
      innerRef.current.rotation.z = -t * 0.09 + mx * 0.12;
      innerRef.current.rotation.x = t * 0.04;
    }
    if (haloRef.current) {
      const haloOpacity = chapterProgress * 0.18 + ctaProgress * 0.3;
      (haloRef.current.material as THREE.MeshStandardMaterial).opacity = haloOpacity;
      haloRef.current.scale.setScalar(scale * 1.5);
    }

    // Orbit shards
    if (orbitGroup.current) {
      orbitGroup.current.rotation.z = t * 0.05;
      orbitGroup.current.rotation.y = t * 0.03 + mx * 0.2;
      orbitGroup.current.rotation.x = my * 0.15;
      orbitGroup.current.scale.setScalar(scale);
    }
    orbitRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const shard = orbitShards[i];
      const a = shard.angle + t * shard.speed;
      mesh.position.x = Math.cos(a) * shard.radius;
      mesh.position.y = Math.sin(a) * shard.radius * 0.4;
      mesh.rotation.z = t * 0.3 + i;
    });
  });

  return (
    <>
      {/* Outer eclipse ring */}
      <mesh ref={outerRef}>
        <torusGeometry args={[2.4, 0.06, 16, 128]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1.0}
          roughness={0.18}
          emissive="#8a6b1f"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Inner thinner ring */}
      <mesh ref={innerRef}>
        <torusGeometry args={[2.4, 0.02, 8, 128]} />
        <meshStandardMaterial
          color="#f3dfa0"
          metalness={1.0}
          roughness={0.1}
          emissive="#f3dfa0"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Soft glow halo disk */}
      <mesh ref={haloRef} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[2.0, 3.0, 64]} />
        <meshStandardMaterial
          color="#d4af37"
          transparent
          opacity={0}
          emissive="#d4af37"
          emissiveIntensity={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting shard group */}
      <group ref={orbitGroup}>
        {orbitShards.map((_, i) => (
          <mesh
            key={i}
            ref={(el) => { orbitRefs.current[i] = el; }}
          >
            <octahedronGeometry args={[0.045 + (i % 3) * 0.02, 0]} />
            <meshStandardMaterial
              color="#f3dfa0"
              metalness={1}
              roughness={0.1}
              emissive="#d4af37"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};
