import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const SceneContents: React.FC = () => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const capsuleRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const torusRingRef = useRef<THREE.Mesh>(null);

  // Use refs instead of state to avoid React re-renders on every mouse/scroll event
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5;
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollRef.current;
    const mouse = mouseRef.current;

    if (capsuleRef.current) {
      capsuleRef.current.rotation.y = t * 0.2;
      capsuleRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    }

    if (cylinderRef.current) {
      cylinderRef.current.rotation.y -= 0.006;
      cylinderRef.current.rotation.x += 0.002;
    }

    if (torusRef.current && torusRingRef.current) {
      torusRef.current.rotation.z = t * 0.18;
      torusRingRef.current.rotation.z = t * 0.18;
    }

    if (groupRef.current) {
      // Smooth dampen mouse parallax
      groupRef.current.rotation.y += (mouse.x * 0.4 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (mouse.y * 0.2 - groupRef.current.rotation.x) * 0.05;
      // Scroll Y shift
      groupRef.current.position.y = -scroll * 5.0;
    }

    // Camera scroll zoom
    camera.position.z = 9 - scroll * 2.5;
  });

  return (
    <group ref={groupRef}>
      {/* 1. Floating Glass Capsule with gold band — reduced segments for perf */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
        <group ref={capsuleRef}>
          {/* Glass Capsule — MeshTransmissionMaterial but with samples=1 for perf */}
          <mesh rotation-z={0.15}>
            <capsuleGeometry args={[1.05, 2.3, 8, 24]} />
            <MeshTransmissionMaterial
              backside={false}
              transmission={0.9}
              thickness={0.8}
              roughness={0.1}
              anisotropy={0.5}
              color="#fff6e0"
              samples={1}
            />
          </mesh>

          {/* Gold Center Band — reduced segments */}
          <mesh rotation-x={Math.PI / 2} rotation-z={0.15}>
            <torusGeometry args={[1.08, 0.09, 12, 48]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1.0}
              roughness={0.3}
            />
          </mesh>
        </group>
      </Float>

      {/* 2. Gold Cylinder — reduced segments */}
      <Float speed={1.0} rotationIntensity={0.3} floatIntensity={0.35}>
        <mesh ref={cylinderRef} position={[-3.4, 1.1, -1.5]} rotation={[0.5, 0.3, 0.6]}>
          <cylinderGeometry args={[0.55, 0.55, 2.1, 24]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={1.0}
            roughness={0.3}
          />
        </mesh>
      </Float>

      {/* 3. Glass Torus — simple material, reduced segments */}
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.25}>
        <group>
          <mesh ref={torusRef} position={[3.2, -0.9, -1.2]} rotation={[1.1, 0.4, 0]}>
            <torusGeometry args={[1.15, 0.32, 16, 48]} />
            <meshStandardMaterial
              color="#d9c48a"
              metalness={0.1}
              roughness={0.05}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Gold ring outline */}
          <mesh ref={torusRingRef} position={[3.2, -0.9, -1.2]} rotation={[1.1, 0.4, 0]}>
            <torusGeometry args={[1.15, 0.03, 8, 48]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1.0}
              roughness={0.3}
            />
          </mesh>
        </group>
      </Float>

      {/* 4. Low-count particles for performance */}
      <Sparkles count={60} scale={14} size={1.2} speed={0.15} color="#d4af37" opacity={0.5} />
    </group>
  );
};

export const InteractiveBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-[#07060a]">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{
          antialias: false,       // Disable MSAA for perf
          alpha: true,
          powerPreference: "default",
        }}
        dpr={[1, 1.5]}            // Cap pixel ratio at 1.5 max
        performance={{ min: 0.5 }} // Allow R3F to drop to 50% quality if needed
      >
        <ambientLight intensity={0.9} color="#1a1408" />
        <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffcf7a" />
        <pointLight position={[-3, 1, 6]} intensity={0.9} distance={30} color="#fff6e6" />
        <pointLight position={[3, -2, -4]} intensity={0.6} distance={30} color="#d4af37" />
        {/* No Environment preset — avoids HDR download & cube render pass */}
        <SceneContents />
      </Canvas>
    </div>
  );
};

export default InteractiveBackground;
