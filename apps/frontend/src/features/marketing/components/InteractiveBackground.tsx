import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbProps {
  position: [number, number, number];
  size: number;
  speed: number;
  color: string;
}

const FloatingOrb: React.FC<OrbProps> = ({ position, size, speed, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle sine-wave floating motion
      meshRef.current.position.y = initialY + Math.sin(state.clock.getElapsedTime() * speed) * 0.4;
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[size, 1]} />
      <meshBasicMaterial color={color} wireframe opacity={0.12} transparent />
    </mesh>
  );
};

export const InteractiveBackground: React.FC = () => {
  const orbs = useMemo(() => {
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"]; // blue, purple, pink, emerald
    return Array.from({ length: 20 }).map((_, idx) => ({
      position: [
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      size: 0.15 + Math.random() * 0.7,
      speed: 0.15 + Math.random() * 0.4,
      color: colors[idx % colors.length],
    }));
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-50 dark:opacity-30">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.6} />
        {orbs.map((orb, idx) => (
          <FloatingOrb key={idx} {...orb} />
        ))}
      </Canvas>
    </div>
  );
};
export default InteractiveBackground;
