import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Setup Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // 2. Lights
    scene.add(new THREE.AmbientLight(0x1a1408, 1.1));

    const goldLight = new THREE.DirectionalLight(0xffcf7a, 1.4);
    goldLight.position.set(4, 6, 5);
    scene.add(goldLight);

    const frontLight = new THREE.PointLight(0xfff6e6, 1.1, 30);
    frontLight.position.set(-3, 1, 6);
    scene.add(frontLight);

    const rimLight = new THREE.PointLight(0xd4af37, 0.8, 30);
    rimLight.position.set(3, -2, -4);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    // 3. Materials
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff6e0,
      transparent: true,
      opacity: 0.22,
      roughness: 0.06,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
    });

    const glassMat2 = new THREE.MeshPhysicalMaterial({
      color: 0xd9c48a,
      transparent: true,
      opacity: 0.16,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 1,
      roughness: 0.28,
      emissive: 0x3a2b06,
      emissiveIntensity: 0.12,
    });

    // 4. Geometries & Meshes
    // Capsule builder
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [glassMat, glassMat2, goldMat];

    const buildCapsule = (radius: number, cylHeight: number, mat: THREE.Material) => {
      const g = new THREE.Group();
      
      const cylGeo = new THREE.CylinderGeometry(radius, radius, cylHeight, 48, 1, true);
      geometriesToDispose.push(cylGeo);
      const cyl = new THREE.Mesh(cylGeo, mat);
      g.add(cyl);

      const topCapGeo = new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      geometriesToDispose.push(topCapGeo);
      const topCap = new THREE.Mesh(topCapGeo, mat);
      topCap.position.y = cylHeight / 2;
      g.add(topCap);

      const botCapGeo = new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      geometriesToDispose.push(botCapGeo);
      const botCap = new THREE.Mesh(botCapGeo, mat);
      botCap.position.y = -cylHeight / 2;
      g.add(botCap);

      return g;
    };

    const capsule = buildCapsule(1.05, 2.3, glassMat);
    capsule.rotation.z = 0.15;
    group.add(capsule);

    const bandGeo = new THREE.TorusGeometry(1.08, 0.09, 20, 64);
    geometriesToDispose.push(bandGeo);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.rotation.x = Math.PI / 2;
    band.rotation.z = 0.15;
    capsule.add(band);

    // Gold cylinder (left)
    const cylLeftGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.1, 48);
    geometriesToDispose.push(cylLeftGeo);
    const cylinder = new THREE.Mesh(cylLeftGeo, goldMat);
    cylinder.position.set(-3.4, 1.1, -1.5);
    cylinder.rotation.set(0.5, 0.3, 0.6);
    group.add(cylinder);

    // Glass torus (right)
    const torusGeo = new THREE.TorusGeometry(1.15, 0.32, 32, 96);
    geometriesToDispose.push(torusGeo);
    const torus = new THREE.Mesh(torusGeo, glassMat2);
    torus.position.set(3.2, -0.9, -1.2);
    torus.rotation.set(1.1, 0.4, 0);
    group.add(torus);

    const torusRingGeo = new THREE.TorusGeometry(1.15, 0.03, 16, 96);
    geometriesToDispose.push(torusRingGeo);
    const torusRing = new THREE.Mesh(torusRingGeo, goldMat);
    torusRing.position.copy(torus.position);
    torusRing.rotation.copy(torus.rotation);
    group.add(torusRing);

    // Particles (stars)
    const pGeo = new THREE.BufferGeometry();
    geometriesToDispose.push(pGeo);
    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const pMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(pMat);

    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    // 5. Interactivity Listeners
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      targetRotY = mouseX * 0.5;
      targetRotX = mouseY * 0.25;
    };

    let scrollT = 0;
    const onScroll = () => {
      scrollT = window.scrollY / container.clientHeight;
    };

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    // 6. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      capsule.rotation.y = t * 0.25;
      capsule.position.y = Math.sin(t * 0.6) * 0.18;

      cylinder.rotation.y -= 0.008;
      cylinder.rotation.x += 0.002;

      torus.rotation.z = t * 0.2;
      torusRing.rotation.z = t * 0.2;

      particles.rotation.y = t * 0.02;

      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

      group.position.y = -scrollT * 2.2;
      camera.position.z = 9 - scrollT * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Component Unmount Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-black"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default InteractiveBackground;
