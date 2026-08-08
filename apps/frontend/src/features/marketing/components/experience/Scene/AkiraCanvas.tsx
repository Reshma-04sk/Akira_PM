import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Fog } from "../world/Fog";
import { Lighting } from "../world/Lighting";
import { CameraRig } from "../world/CameraRig";
import { Eclipse } from "../world/Eclipse";
import { FloatingObjects } from "../world/FloatingObjects";
import { Particles } from "../effects/Particles";

interface AkiraCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const AkiraCanvas: React.FC<AkiraCanvasProps> = ({
  scrollProgress,
  mouseRef,
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9.0], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={(state) => {
          const canvasEl = state.gl.domElement;
          canvasEl.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL Context Lost detected. Restoring renderer state...");
          }, false);
        }}
      >
        <Fog />
        <Lighting scrollProgress={scrollProgress} mouseRef={mouseRef} />
        
        {/* 
          GPU-Generated HDR Studio Environment.
          Places custom lightformer panels to generate glossy reflections on the metallic toruses
          dynamically without loading slow/unstable external network HDR textures.
        */}
        <Environment resolution={256}>
          {/* Overhead warm soft-box emitter */}
          <Lightformer
            form="rect"
            intensity={4.5}
            position={[0, 8, 0]}
            scale={[12, 6, 1]}
            rotation-x={Math.PI / 2}
            color="#ffe2a3"
          />

          {/* Left white fill soft-panel */}
          <Lightformer
            form="rect"
            intensity={2.2}
            position={[-8, 2, 4]}
            scale={[5, 12, 1]}
            rotation-y={-Math.PI / 4}
            color="#ffffff"
          />

          {/* Right electric blue back panel rim */}
          <Lightformer
            form="rect"
            intensity={5.0}
            position={[7, 3, -6]}
            scale={[4, 10, 1]}
            rotation-y={Math.PI / 4}
            color="#4382fa"
          />

          {/* Golden radial background reflection ring */}
          <Lightformer
            form="ring"
            intensity={3.5}
            position={[0, 0, -3]}
            scale={[6, 6, 1]}
            color="#ffe9a0"
          />
        </Environment>

        {/* Layered Golden Eclipse centerpiece (sits directly behind title) */}
        <Eclipse scrollProgress={scrollProgress} />
        
        {/* 250 Premium calm orbital particles */}
        <Particles scrollProgress={scrollProgress} mouseRef={mouseRef} />
        
        {/* Floating crystalline/metal shapes that scale/fade along with workspace */}
        <FloatingObjects mouseRef={mouseRef} scrollProgress={scrollProgress} />
        
        <CameraRig scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default AkiraCanvas;
