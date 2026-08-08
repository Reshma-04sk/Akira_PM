import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  count?: number;
}

interface ParticleItem {
  radius: number;
  angle: number;
  speed: number;
  baseHeight: number;
  size: number;
  verticalPhase: number;
  verticalSpeed: number;
  zOffset: number;
  layer: 1 | 2 | 3;
}

export const Particles: React.FC<ParticlesProps> = ({
  scrollProgress,
  mouseRef,
  count = 250, // Reduced to 250 to ensure typography readability and prevent visual clutter
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Compute orbital parameters for 3 premium visual layers
  const particleData = useMemo(() => {
    const data: ParticleItem[] = [];

    // Proportions: ~12% Layer 1, ~56% Layer 2, ~32% Layer 3
    const count1 = Math.round(count * 0.12);
    const count2 = Math.round(count * 0.56);
    const count3 = count - count1 - count2;

    // Layer 1: close particles inside the ring hole
    for (let i = 0; i < count1; i++) {
      const radius = 0.2 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.015 + Math.random() * 0.025) * (Math.random() > 0.5 ? 1 : -1);
      const baseHeight = (Math.random() - 0.5) * 3.5;
      const size = 0.004 + Math.random() * 0.006;
      const verticalPhase = Math.random() * Math.PI * 2;
      const verticalSpeed = 0.06 + Math.random() * 0.12;
      const zOffset = (Math.random() - 0.5) * 0.8;
      data.push({ radius, angle, speed, baseHeight, size, verticalPhase, verticalSpeed, zOffset, layer: 1 });
    }

    // Layer 2: medium particles outside torus bounds
    for (let i = 0; i < count2; i++) {
      const radius = 2.8 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.006 + Math.random() * 0.014) * (Math.random() > 0.5 ? 1 : -1);
      const baseHeight = (Math.random() - 0.5) * 5.0;
      const size = 0.01 + Math.random() * 0.008;
      const verticalPhase = Math.random() * Math.PI * 2;
      const verticalSpeed = 0.03 + Math.random() * 0.06;
      const zOffset = (Math.random() - 0.5) * 1.5;
      data.push({ radius, angle, speed, baseHeight, size, verticalPhase, verticalSpeed, zOffset, layer: 2 });
    }

    // Layer 3: distant background particles
    for (let i = 0; i < count3; i++) {
      const radius = 5.4 + Math.random() * 3.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.002 + Math.random() * 0.007) * (Math.random() > 0.5 ? 1 : -1);
      const baseHeight = (Math.random() - 0.5) * 7.5;
      const size = 0.016 + Math.random() * 0.012;
      const verticalPhase = Math.random() * Math.PI * 2;
      const verticalSpeed = 0.01 + Math.random() * 0.03;
      const zOffset = -2.5 - Math.random() * 3.5;
      data.push({ radius, angle, speed, baseHeight, size, verticalPhase, verticalSpeed, zOffset, layer: 3 });
    }

    return data;
  }, [count]);

  // 2. Precompute instanced colors based on layers
  const colors = useMemo(() => {
    const list: THREE.Color[] = [];
    const colorBright = new THREE.Color("#ffe9a0"); // Bright Champagne Gold
    const colorMedium = new THREE.Color("#d4af37"); // Classic Gold
    const colorDistant = new THREE.Color("#806018"); // Amber/Muted Gold

    const count1 = Math.round(count * 0.12);
    const count2 = Math.round(count * 0.56);

    for (let i = 0; i < count; i++) {
      if (i < count1) list.push(colorBright);
      else if (i < count1 + count2) list.push(colorMedium);
      else list.push(colorDistant);
    }
    return list;
  }, [count]);

  // Bind colors on initialization
  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        meshRef.current.setColorAt(i, colors[i]);
      }
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [colors, count]);

  // 3. Render frame loop for premium orbital drift and soft twinkle fades
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];

      // Slow orbital calculation
      const currentAngle = p.angle + t * p.speed;
      const x = Math.cos(currentAngle) * p.radius + mx * 0.22;
      const z = Math.sin(currentAngle) * p.radius + p.zOffset + my * 0.22;
      
      // Vertical breathing drift, adjusting slightly on scroll
      let y = p.baseHeight + Math.sin(t * p.verticalSpeed + p.verticalPhase) * 0.18 - scroll * 1.5;

      // Wrap around screen boundaries for a continuous loop
      if (y < -8.0) {
        y += 16.0;
      }

      dummy.position.set(x, y, z);

      // Layer-specific slow twinkle fade-in/out multiplier
      const twinkleFreq = p.layer === 1 ? 1.6 : p.layer === 2 ? 0.9 : 0.35;
      const twinkle = 0.22 + 0.78 * Math.sin(t * twinkleFreq + p.verticalPhase);

      dummy.scale.setScalar(p.size * twinkle);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Tiny clean octahedrons mapping dust facets */}
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        metalness={0.9}
        roughness={0.12}
        emissive="#ffe9a0"
        emissiveIntensity={0.25}
      />
    </instancedMesh>
  );
};

export default Particles;
