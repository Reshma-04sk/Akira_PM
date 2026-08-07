import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineState } from "../../../timeline/ScrollTimeline";

interface ParticlesProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  count?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  scrollProgress,
  mouseRef,
  count = 1200,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute initial stardust orbital parameters
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.02 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1);
      const baseHeight = (Math.random() - 0.5) * 6.5;
      const size = 0.006 + Math.random() * 0.022;
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

    const timeline = getTimelineState(scroll);
    // Push particles out when the split sequence is active
    const xPush = timeline.splitOffset * 3.0;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];

      const currentAngle = p.angle + t * p.speed;
      let x = Math.cos(currentAngle) * p.radius + mx * 0.35;
      const z = Math.sin(currentAngle) * p.radius + my * 0.35;
      let y = p.baseHeight + Math.sin(t * p.verticalSpeed + p.verticalPhase) * 0.15 - scroll * 4.0;

      // Apply horizontal split push
      if (x > 0) x += xPush;
      else x -= xPush;

      // Reposition / wrap-around vertically if they scroll too far down
      if (y < -7.0) {
        y += 14.0;
      }

      dummy.position.set(x, y, z);

      // Simple twinkle effect
      const twinkle = 0.3 + 0.7 * Math.sin(t * 3.0 + p.verticalPhase);
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
        emissiveIntensity={0.8}
      />
    </instancedMesh>
  );
};

export default Particles;
