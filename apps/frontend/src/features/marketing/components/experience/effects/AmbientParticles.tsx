import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "../hooks/ExperienceContext";

interface ParticleItem {
  position: THREE.Vector3;
  speed: number;
  phase: number;
  size: number;
  verticalSpeed: number;
}

export const AmbientParticles: React.FC = () => {
  const count = 90; // Balanced density representing background data dust
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { mouseRef } = useExperience();

  // Create 90 random particle seeds dispersed in space
  const particles = useMemo(() => {
    const list: ParticleItem[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 12.0,
          (Math.random() - 0.5) * 8.0,
          (Math.random() - 0.5) * 5.0 - 1.0
        ),
        speed: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        size: 0.0035 + Math.random() * 0.0045,
        verticalSpeed: 0.05 + Math.random() * 0.08,
      });
    }
    return list;
  }, []);

  // Precompute instance colors: muted gray-graphite and indigo
  const colors = useMemo(() => {
    const list: THREE.Color[] = [];
    const colorSilver = new THREE.Color("#8b95a5");
    const colorMuted = new THREE.Color("#596273");
    const colorIndigo = new THREE.Color("#7c8cff");

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      if (rand < 0.15) list.push(colorIndigo);
      else if (rand < 0.50) list.push(colorSilver);
      else list.push(colorMuted);
    }
    return list;
  }, []);

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
  }, [colors]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    particles.forEach((p, i) => {
      // Calculate slow orbital/Brownian coordinate drifts
      const orbitX = Math.sin(t * p.speed + p.phase) * 0.15;
      const orbitY = Math.cos(t * p.verticalSpeed + p.phase) * 0.15;

      // Mouse parallax offsets (subtle 1% shift)
      const px = p.position.x + orbitX + mx * 0.08;
      const py = p.position.y + orbitY + my * 0.08;
      const pz = p.position.z;

      dummy.position.set(px, py, pz);

      // Muted slow twinkle factor
      const twinkle = 0.3 + 0.7 * Math.sin(t * 0.8 + p.phase);
      dummy.scale.setScalar(p.size * twinkle);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial transparent opacity={0.35} />
    </instancedMesh>
  );
};

export default AmbientParticles;
