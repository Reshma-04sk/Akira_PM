# Akira PM — Visual & Motion Language Specification

This document defines the core aesthetic rules, spacing metrics, animation easing, lighting design, particle physics, and branding principles for Akira PM.

---

## 🎨 Design & Aesthetic Principles

### 1. Obsidian Depth (Background)
- **Primary Background**: Matte obsidian black (`#07060a`), never pure black `#000000`.
- **Secondary Surfaces**: Card surfaces use `#0b0a0f` with an opacity multiplier of `0.65` and backdrop-blur of `16px`.
- **Subtle Gradients**: Radial gradients from `#0f0d14` to `#07060a` with a low-opacity center amber highlight (`rgba(212,175,55,0.03)`).

### 2. Champagne Accent (Gold & Bronze)
- **Base Accent**: Champagne Gold (`#ffe9a0`), metallic gloss gold (`#d4af37`), and deep bronze shadow bounds (`#8a6b1f`).
- **Gold Rule**: Gold should occupy less than **5% of the visual space**. It is used purely for critical priority boundaries, node intersections, active UI underlines, and core particle reflections.
- **Micro-shadows**: All golden text and elements use a soft glow offset: `filter: drop-shadow(0 2px 8px rgba(212,175,55,0.15))`.

### 3. Glassmorphism
- **Heavy Backdrop Blur**: `backdrop-filter: blur(20px)` for high-tier layout wrappers, and `blur(12px)` for transient cards.
- **Layers & Z-Indices**:
  - `z-index: -20` : Obsidian canvas background
  - `z-index: 0`   : Real-time 3D canvas
  - `z-index: 10`  : Interactive glass HTML workspace
  - `z-index: 20`  : Ambient fog and particle layers
  - `z-index: 50`  : Popups, modals, and toasts

---

## 🎬 Motion & Animation Principles

### 1. Easing Curves
- **Primary Easing**: Cinematic ease out cubic-bezier `[0.16, 1, 0.3, 1]` for layout assemblies.
- **Spring Physics**:
  - Kanban card drops: `stiffness: 220, damping: 20` (light kinetic bounce).
  - Monolith slide-in: `stiffness: 150, damping: 24` (controlled deceleration).
  - Magnetic buttons: `stiffness: 300, damping: 18` (responsive attraction).

### 2. Camera Choreography (Lenses & Speeds)
- **Dolly Movement**: Smooth interpolations using linear step maps (`ScrollTimeline` and `CameraTimeline`).
- **Cinema Lenses**:
  - **Arrival (Ch 1)**: Wide/cinematic 85mm lens mapping (`fov: 35`), very tight focal range, slow dolly forward, tiny mouse parallax.
  - **Execution (Ch 4)**: 35mm lens mapping (`fov: 48`), wide perspective to fit Kanban column columns, slight camera rotation (`rotation.y = 0.08`), focus dynamic follow of the moving task cards.

---

## 💡 Lighting & Reflection Systems

### 1. Volumetric Light Mapping
- **Key Light**: High-intensity Directional Light (`intensity={3.2}`) casting gold shadows. Moves slightly with cursor.
- **Rim Light**: Cool white/blue point light (`intensity={1.8}`) placed behind translucent meshes for clear glass diffraction edges.
- **Chamber Fog**: Fog parameters clamp coordinates to prevent light bleed: `<fog color="#07060a" near={5.0} far={18.0} />`.

### 2. Mood Choreography
- **Arrival (Ch 1)**: Pitch darkness, only golden particle embers visible.
- **Intelligence (Ch 2)**: Warm gold core glow, high-intensity light reflections.
- **Creation (Ch 3)**: Clean white engineering light.
- **Insight (Ch 5)**: Soft amber dashboard glow.
- **Trust (Ch 7)**: Dark shadows, safety blue rim light.
- **Beginning (Ch 10)**: Golden halo bloom from the joined eclipse ring.

---

## 🌌 Particle Physics & Orbital Dynamics

1.  **Instanced Draw Calls**: Particles are rendered as instanced geometry (`instancedMesh` with 1150 capacity).
2.  **Galactic Orbit**: Particle movement rotates around the central axis (`cos(a) * r` and `sin(a) * r`) rather than random jitter. Speed is inversely proportional to radius (Keplerian physics).
3.  **Twinkle & Noise**: Emission changes dynamically using sine functions synchronized with vertical height wrap-arounds.

---

## ♿ Interaction, Accessibility & Performance

### 1. Accessibility (A11y)
- **Prefers Reduced Motion**: Read `useReducedMotion()`. If enabled, override timeline styles: disable camera dollies, skip R3F renders, and resolve HTML entries immediately.
- **Keyboard Traps & Focus**: Interactive buttons and card items must feature high-contrast focus rings: `focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:outline-none`.

### 2. Performance Budget
- **Target Frame Rate**: Consistent **60 FPS** on standard GPUs.
- **GC Management**: Reuse temporary vectors (`THREE.Vector3`, `THREE.Matrix4`, `THREE.Quaternion`) inside render loops instead of instantiating new objects.
