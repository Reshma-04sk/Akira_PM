import * as THREE from "three";

export interface Keyframe {
  scroll: number;
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
  cameraFov: number;
  lightIntensity: number;
  lightColor: string;
  splitOffset: number; // 0 (closed) to 1 (wide split)
  corePulse: number; // intensity multiplier for AI Core
}

export const TIMELINE_KEYFRAMES: Keyframe[] = [
  {
    scroll: 0.0, // Ch 1: Arrival (Start of Hero)
    cameraPos: [0, 0, 9.0],
    cameraLookAt: [0, 0, 0],
    cameraFov: 35,
    lightIntensity: 0.15,
    lightColor: "#ffe2a3",
    splitOffset: 0.0,
    corePulse: 0.2,
  },
  {
    scroll: 0.2, // Ch 1: Arrival End
    cameraPos: [0, 0, 8.2],
    cameraLookAt: [0, 0, 0],
    cameraFov: 35,
    lightIntensity: 0.3,
    lightColor: "#ffe2a3",
    splitOffset: 0.0,
    corePulse: 0.4,
  },
  {
    scroll: 0.3, // Ch 2: Intelligence (AI Core)
    cameraPos: [0, 0, 7.5],
    cameraLookAt: [0, 0, 0],
    cameraFov: 38,
    lightIntensity: 2.8,
    lightColor: "#ffbf3f",
    splitOffset: 0.0,
    corePulse: 1.5,
  },
  {
    scroll: 0.4, // Ch 3: Creation (Workspace Assembly)
    cameraPos: [0, -0.8, 7.0],
    cameraLookAt: [0, -0.8, 0],
    cameraFov: 42,
    lightIntensity: 2.2,
    lightColor: "#ffffff",
    splitOffset: 0.5,
    corePulse: 0.8,
  },
  {
    scroll: 0.55, // Ch 4: Execution (Kanban)
    cameraPos: [-2.5, 0, 5.8],
    cameraLookAt: [-2.5, 0, 0],
    cameraFov: 48,
    lightIntensity: 2.5,
    lightColor: "#ffffff",
    splitOffset: 1.0,
    corePulse: 0.5,
  },
  {
    scroll: 0.65, // Ch 5: Insight (Analytics)
    cameraPos: [2.5, -1.0, 5.8],
    cameraLookAt: [2.5, -1.0, 0],
    cameraFov: 48,
    lightIntensity: 2.0,
    lightColor: "#ffcf7a",
    splitOffset: 1.0,
    corePulse: 0.6,
  },
  {
    scroll: 0.75, // Ch 6: Collaboration (Twinkle Node Field)
    cameraPos: [0, 2.0, 6.2],
    cameraLookAt: [0, 0, 0],
    cameraFov: 42,
    lightIntensity: 2.2,
    lightColor: "#ffe2a3",
    splitOffset: 0.0, // Re-joins for Signature Moment collapse!
    corePulse: 2.2,
  },
  {
    scroll: 0.85, // Ch 7: Trust (Security vault)
    cameraPos: [-3.0, 0.5, 7.0],
    cameraLookAt: [0, 0, 0],
    cameraFov: 45,
    lightIntensity: 1.8,
    lightColor: "#3b82f6", // Security Blue rim
    splitOffset: 0.4,
    corePulse: 0.7,
  },
  {
    scroll: 0.9, // Ch 8: Scale (Enterprise Node Graph)
    cameraPos: [3.0, 1.2, 7.0],
    cameraLookAt: [0, 0, 0],
    cameraFov: 40,
    lightIntensity: 2.4,
    lightColor: "#ffe2a3",
    splitOffset: 0.5,
    corePulse: 1.0,
  },
  {
    scroll: 0.95, // Ch 9: Investment (Pricing Plans)
    cameraPos: [0, -2.6, 6.5],
    cameraLookAt: [0, 0, 0],
    cameraFov: 42,
    lightIntensity: 2.6,
    lightColor: "#ffb03a",
    splitOffset: 0.3,
    corePulse: 0.8,
  },
  {
    scroll: 1.0, // Ch 10: Beginning (CTA)
    cameraPos: [0, 0, 8.5],
    cameraLookAt: [0, 0, 0],
    cameraFov: 35,
    lightIntensity: 3.2,
    lightColor: "#ffe9a0",
    splitOffset: 0.0, // Re-joined for CTA halo reveal
    corePulse: 1.8,
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
