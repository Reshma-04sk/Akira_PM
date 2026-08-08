import * as THREE from "three";

export interface Keyframe {
  scroll: number;
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
  cameraFov: number;
  lightIntensity: number;
  lightColor: string;
  splitOffset: number; // 0 (closed) to 1 (wide split)
  corePulse: number;
}

export const TIMELINE_KEYFRAMES: Keyframe[] = [
  {
    scroll: 0.0, // Hero state: Eclipse centered, closed, calm
    cameraPos: [0, 0, 8.5],
    cameraLookAt: [0, 0, 0],
    cameraFov: 35,
    lightIntensity: 1.5,
    lightColor: "#ffe9a0",
    splitOffset: 0.0,
    corePulse: 0.2,
  },
  {
    scroll: 0.15, // Hero still dominant, camera about to push
    cameraPos: [0, 0, 8.5],
    cameraLookAt: [0, 0, 0],
    cameraFov: 35,
    lightIntensity: 1.6,
    lightColor: "#ffe9a0",
    splitOffset: 0.0,
    corePulse: 0.2,
  },
  {
    scroll: 0.30, // Camera pushes forward, entering Eclipse
    cameraPos: [0, 0, 6.8],
    cameraLookAt: [0, 0, 0],
    cameraFov: 36,
    lightIntensity: 2.2,
    lightColor: "#ffe9a0",
    splitOffset: 0.0,
    corePulse: 0.4,
  },
  {
    scroll: 0.45, // Eclipse separations horizontally, camera moves slightly lateral
    cameraPos: [-0.6, 0.15, 6.8],
    cameraLookAt: [0, 0.15, 0],
    cameraFov: 38,
    lightIntensity: 2.6,
    lightColor: "#ffffff",
    splitOffset: 1.0,
    corePulse: 0.6,
  },
  {
    scroll: 0.60, // Workspace shell materializes
    cameraPos: [0.2, 0.15, 6.8],
    cameraLookAt: [0, 0.15, 0],
    cameraFov: 38,
    lightIntensity: 2.8,
    lightColor: "#ffffff",
    splitOffset: 1.0,
    corePulse: 0.6,
  },
  {
    scroll: 0.75, // Kanban columns assemble, headers fade in
    cameraPos: [0.4, 0.15, 6.8],
    cameraLookAt: [0.1, 0.15, 0],
    cameraFov: 38,
    lightIntensity: 3.0,
    lightColor: "#ffffff",
    splitOffset: 1.0,
    corePulse: 0.7,
  },
  {
    scroll: 0.90, // Cards animate, AI typing cursor fires
    cameraPos: [0.0, 0.15, 6.8],
    cameraLookAt: [0.0, 0.15, 0],
    cameraFov: 36,
    lightIntensity: 3.0,
    lightColor: "#ffe9a0",
    splitOffset: 1.0,
    corePulse: 0.8,
  },
  {
    scroll: 1.0, // Stable interactive workspace state
    cameraPos: [0.0, 0.15, 6.8],
    cameraLookAt: [0.0, 0.15, 0],
    cameraFov: 35,
    lightIntensity: 3.0,
    lightColor: "#ffe9a0",
    splitOffset: 1.0,
    corePulse: 0.8,
  },
];

// Helper to interpolate between two values linearly
const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

// Search keyframes and interpolate values based on scroll position
export const getTimelineState = (scroll: number) => {
  // Clamp scroll between 0 and 1
  const s = Math.max(0, Math.min(1, scroll));

  // Find active keyframe interval
  let startKf = TIMELINE_KEYFRAMES[0];
  let endKf = TIMELINE_KEYFRAMES[TIMELINE_KEYFRAMES.length - 1];

  for (let i = 0; i < TIMELINE_KEYFRAMES.length - 1; i++) {
    if (s >= TIMELINE_KEYFRAMES[i].scroll && s <= TIMELINE_KEYFRAMES[i + 1].scroll) {
      startKf = TIMELINE_KEYFRAMES[i];
      endKf = TIMELINE_KEYFRAMES[i + 1];
      break;
    }
  }

  const range = endKf.scroll - startKf.scroll;
  const progress = range > 0 ? (s - startKf.scroll) / range : 0;

  // Cinematic interpolation (cosine easing to make movements premium)
  const t = (1 - Math.cos(progress * Math.PI)) / 2;

  // Interpolate camera positions
  const px = lerp(startKf.cameraPos[0], endKf.cameraPos[0], t);
  const py = lerp(startKf.cameraPos[1], endKf.cameraPos[1], t);
  const pz = lerp(startKf.cameraPos[2], endKf.cameraPos[2], t);

  const lx = lerp(startKf.cameraLookAt[0], endKf.cameraLookAt[0], t);
  const ly = lerp(startKf.cameraLookAt[1], endKf.cameraLookAt[1], t);
  const lz = lerp(startKf.cameraLookAt[2], endKf.cameraLookAt[2], t);

  const fov = lerp(startKf.cameraFov, endKf.cameraFov, t);
  const lightIntensity = lerp(startKf.lightIntensity, endKf.lightIntensity, t);
  const splitOffset = lerp(startKf.splitOffset, endKf.splitOffset, t);
  const corePulse = lerp(startKf.corePulse, endKf.corePulse, t);

  // Interpolate light hex colors
  const c1 = new THREE.Color(startKf.lightColor);
  const c2 = new THREE.Color(endKf.lightColor);
  const color = c1.lerp(c2, t);

  return {
    cameraPos: new THREE.Vector3(px, py, pz),
    cameraLookAt: new THREE.Vector3(lx, ly, lz),
    cameraFov: fov,
    lightIntensity,
    lightColor: color,
    splitOffset,
    corePulse,
  };
};
