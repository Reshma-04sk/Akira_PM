import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FloatingObjectsProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const FloatingObjects: React.FC<FloatingObjectsProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  const capsuleRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const shard1Ref = useRef<THREE.Mesh>(null);
  const shard2Ref = useRef<THREE.Mesh>(null);
  const shard3Ref = useRef<THREE.Mesh>(null);

  const goldMat = {
    color: "#d4af37" as THREE.ColorRepresentation,
    metalness: 1.0,
    roughness: 0.2,
    emissive: "#3a2b06" as THREE.ColorRepresentation,
    emissiveIntensity: 0.15,
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scroll = scrollProgress.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const parallax = { x: mx * 0.4, y: my * 0.25 };

    if (capsuleRef.current) {
      capsuleRef.current.rotation.y = t * 0.18;
      capsuleRef.current.position.y = -0.3 + Math.sin(t * 0.5) * 0.15 - scroll * 2;
      capsuleRef.current.position.x = -2.2 + parallax.x;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = -t * 0.12;
      sphereRef.current.position.y = 0.8 + Math.cos(t * 0.4) * 0.12 - scroll * 1.5;
      sphereRef.current.position.x = 2.8 + parallax.x * 0.8;
    }
    if (shard1Ref.current) {
      shard1Ref.current.rotation.x = t * 0.3;
      shard1Ref.current.rotation.z = t * 0.2;
      shard1Ref.current.position.set(
        -3.5 + Math.sin(t * 0.6) * 0.2 + parallax.x,
        1.8 + Math.cos(t * 0.5) * 0.15 + parallax.y,
        -1
      );
    }
    if (shard2Ref.current) {
      shard2Ref.current.rotation.y = t * 0.25;
      shard2Ref.current.rotation.x = t * 0.15;
      shard2Ref.current.position.set(
        3.2 + Math.cos(t * 0.4) * 0.2 + parallax.x * 0.6,
        -1.5 + Math.sin(t * 0.6) * 0.12 + parallax.y * 0.6,
        -0.5
      );
    }
    if (shard3Ref.current) {
      shard3Ref.current.rotation.z = -t * 0.2;
      shard3Ref.current.rotation.y = t * 0.3;
      shard3Ref.current.position.set(
        0.8 + Math.sin(t * 0.35) * 0.25 + parallax.x * 0.4,
        2.5 + Math.cos(t * 0.45) * 0.18 + parallax.y * 0.4,
        -2
      );
    }
  });

  return (
    <>
      {/* Glass Capsule */}
      <Float speed={0.8} floatIntensity={0.2}>
        <mesh ref={capsuleRef}>
          <capsuleGeometry args={[0.55, 1.6, 6, 20]} />
          <MeshTransmissionMaterial
            backside={false}
            transmission={0.92}
            thickness={0.6}
            roughness={0.08}
            color="#fff6e0"
            samples={1}
            chromaticAberration={0.02}
          />
        </mesh>
      </Float>

      {/* Gold Metallic Sphere */}
      <Float speed={0.6} floatIntensity={0.15}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshStandardMaterial {...goldMat} />
        </mesh>
      </Float>

      {/* Floating Shards — tetrahedron fragments */}
      <mesh ref={shard1Ref}>
        <tetrahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial {...goldMat} roughness={0.15} />
      </mesh>

      <mesh ref={shard2Ref}>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial {...goldMat} roughness={0.12} />
      </mesh>

      <mesh ref={shard3Ref}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial {...goldMat} roughness={0.1} />
      </mesh>
    </>
  );
};
