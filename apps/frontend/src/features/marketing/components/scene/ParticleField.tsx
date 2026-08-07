import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 200,
  scrollProgress,
  mouseRef,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 7;
      data.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta) * 0.5,
        z: r * Math.cos(phi),
        speed: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        orbitRadius: 0.02 + Math.random() * 0.08,
        size: 0.015 + Math.random() * 0.035,
      });
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];
      const x = p.x + Math.sin(t * p.speed + p.phase) * p.orbitRadius + mx * 0.3;
      const y = p.y + Math.cos(t * p.speed + p.phase) * p.orbitRadius * 0.5 - scroll * 3 + my * 0.2;
      const z = p.z + Math.sin(t * p.speed * 0.5 + p.phase) * p.orbitRadius;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(p.size * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={0.8}
        roughness={0.2}
        emissive="#8a6b1f"
        emissiveIntensity={0.4}
      />
    </instancedMesh>
  );
};
