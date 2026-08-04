import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, Sparkles, ContactShadows, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const SceneContents: React.FC = () => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const capsuleRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const torusRingRef = useRef<THREE.Mesh>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollY(progress);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotate meshes
    if (capsuleRef.current) {
      capsuleRef.current.rotation.y = t * 0.25;
      capsuleRef.current.position.y = Math.sin(t * 0.6) * 0.18;
    }

    if (cylinderRef.current) {
      cylinderRef.current.rotation.y -= 0.008;
      cylinderRef.current.rotation.x += 0.002;
    }

    if (torusRef.current && torusRingRef.current) {
      torusRef.current.rotation.z = t * 0.2;
      torusRingRef.current.rotation.z = t * 0.2;
    }

    // Parallax mouse movements
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.x * 0.5 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (mouse.y * 0.25 - groupRef.current.rotation.x) * 0.04;

      // Parallax scroll position y shift
      groupRef.current.position.y = -scrollY * 5.5;
    }

    // Parallax scroll camera zoom z shift
    camera.position.z = 9 - scrollY * 2.8;
  });

  return (
    <group ref={groupRef}>
      {/* 1. Floating Capsule (with golden band) inside Float helper */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={capsuleRef}>
          {/* Glass Outer Capsule */}
          <mesh rotation-z={0.15}>
            <capsuleGeometry args={[1.05, 2.3, 16, 32]} />
            <MeshTransmissionMaterial
              backside
              backsideThickness={0.2}
              transmission={1.0}
              thickness={1.2}
              roughness={0.06}
              anisotropy={1.0}
              distortion={0.1}
              color="#fff6e0"
            />
          </mesh>

          {/* Golden Center Torus Band */}
          <mesh rotation-x={Math.PI / 2} rotation-z={0.15}>
            <torusGeometry args={[1.08, 0.09, 20, 64]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1.0}
              roughness={0.28}
              emissive="#3a2b06"
              emissiveIntensity={0.12}
            />
          </mesh>
        </group>
      </Float>

      {/* 2. Floating Gold Cylinder (left) */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh ref={cylinderRef} position={[-3.4, 1.1, -1.5]} rotation={[0.5, 0.3, 0.6]}>
          <cylinderGeometry args={[0.55, 0.55, 2.1, 48]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={1.0}
            roughness={0.28}
            emissive="#3a2b06"
            emissiveIntensity={0.12}
          />
        </mesh>
      </Float>

      {/* 3. Floating Glass Torus (right) */}
      <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.3}>
        <group>
          {/* Translucent Glass Torus */}
          <mesh ref={torusRef} position={[3.2, -0.9, -1.2]} rotation={[1.1, 0.4, 0]}>
            <torusGeometry args={[1.15, 0.32, 32, 96]} />
            <MeshTransmissionMaterial
              backside
              transmission={1.0}
              thickness={0.8}
              roughness={0.1}
              color="#d9c48a"
            />
          </mesh>
          
          {/* Gold Torus Ring Outline */}
          <mesh ref={torusRingRef} position={[3.2, -0.9, -1.2]} rotation={[1.1, 0.4, 0]}>
            <torusGeometry args={[1.15, 0.03, 16, 96]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1.0}
              roughness={0.28}
            />
          </mesh>
        </group>
      </Float>

      {/* 4. Subtle Particles */}
      <Sparkles count={140} scale={15} size={1.5} speed={0.2} color="#d4af37" />

      {/* 5. Soft shadows */}
      <ContactShadows position={[0, -3.5, 0]} opacity={0.65} scale={20} blur={2.5} far={4} />
    </group>
  );
};

export const InteractiveBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-[#07060a]">
      <Canvas camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.1} color="#1a1408" />
        <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffcf7a" />
        <pointLight position={[-3, 1, 6]} intensity={1.1} distance={30} color="#fff6e6" />
        <pointLight position={[3, -2, -4]} intensity={0.8} distance={30} color="#d4af37" />
        <Environment preset="sunset" />
        <SceneContents />
      </Canvas>
    </div>
  );
};

export default InteractiveBackground;
