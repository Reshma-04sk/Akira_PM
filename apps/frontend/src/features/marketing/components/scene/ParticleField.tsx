import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 1100,
  scrollProgress,
  mouseRef,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Set up 1000+ orbital particles
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 8.5; // Orbit radii
      const angle = Math.random() * Math.PI * 2; // Initial angle
      const speed = (0.02 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1); // Orbit speed & direction
      const baseHeight = (Math.random() - 0.5) * 6.5; // Elevation
      const size = 0.008 + Math.random() * 0.022; // Tiny elegant stardust size
      const verticalPhase = Math.random() * Math.PI * 2;
      const verticalSpeed = 0.1 + Math.random() * 0.3;

      data.push({
        radius,
        angle,
        speed,
        baseHeight,
        size,
        verticalPhase,
        verticalSpeed,
      });
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Split pushes particles outward
    const splitProgress = Math.min(scroll / 0.4, 1);
    const xPush = splitProgress * 3.0;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];
      
      // Calculate current orbital angle
      const currentAngle = p.angle + t * p.speed;
      
      // Add slight mouse influence to position
      let x = Math.cos(currentAngle) * p.radius + mx * 0.4;
      const z = Math.sin(currentAngle) * p.radius + my * 0.4;
      let y = p.baseHeight + Math.sin(t * p.verticalSpeed + p.verticalPhase) * 0.18 - scroll * 4.0;

      // Apply horizontal split push based on which side they are on
      if (x > 0) x += xPush;
      else x -= xPush;

      // Reposition / wrap-around vertically if they scroll too far down
      if (y < -7.0) {
        y += 14.0; // Wrap back to the top
      }

      dummy.position.set(x, y, z);
      
      // Gentle twinkle effect
      const twinkle = 0.4 + 0.6 * Math.sin(t * 3.0 + p.verticalPhase);
      dummy.scale.setScalar(p.size * twinkle);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#ffe9a0"
        metalness={0.9}
        roughness={0.1}
        emissive="#d4af37"
        emissiveIntensity={1.0}
      />
    </instancedMesh>
  );
};
