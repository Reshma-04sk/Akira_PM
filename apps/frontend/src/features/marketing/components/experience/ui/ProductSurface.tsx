import React, { useEffect, useRef } from "react";
import { useExperience } from "../hooks/ExperienceContext";
import ProductShell from "../product/ProductShell";

export const ProductSurface: React.FC = () => {
  const { scrollProgressRef, mouseRef, prefersReducedMotion } = useExperience();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frameId: number;

    const update = () => {
      const scroll = scrollProgressRef.current;
      const mouse = mouseRef.current; // x, y between -1 and 1

      // 15 Explicit scroll-driven phases:
      // 0.00–0.20: Hero
      // 0.20–0.40: Hero exits
      // 0.40–0.65: Product enters (translateY 140px -> 10px, scale 0.86 -> 0.985, opacity 0.05 -> 0.96)
      // 0.65–0.80: Product settles (translateY 10px -> 0px, scale 0.985 -> 1.0, opacity 0.96 -> 1.0, rotateX 4deg -> 0.5deg)
      // 0.80–1.00: Product holds (locked centerpiece position)
      
      let opacity = 0.05;
      let scale = 0.86;
      let translateY = 140;
      let rotateX = 4;
      let blur = 10;

      if (scroll > 0.40 && scroll <= 0.65) {
        const t = (scroll - 0.40) / 0.25;
        const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
        opacity = 0.05 + ease * 0.91;
        scale = 0.86 + ease * 0.125;
        translateY = 140 - ease * 130;
        blur = 10 - ease * 9;
      } else if (scroll > 0.65 && scroll <= 0.80) {
        const t = (scroll - 0.65) / 0.15;
        const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
        opacity = 0.96 + ease * 0.04;
        scale = 0.985 + ease * 0.015;
        translateY = 10 - ease * 10;
        rotateX = 4 - ease * 3.5;
        blur = 1 - ease * 1;
      } else if (scroll > 0.80) {
        opacity = 1.0;
        scale = 1.0;
        translateY = 0;
        rotateX = 0.5;
        blur = 0;
      }

      // Parallax offsets on mouse movement (outer shell limited strictly to X: +-4px, Y: +-3px)
      const shellParallaxX = mouse.x * 4;
      const shellParallaxY = -mouse.y * 3;

      if (containerRef.current) {
        containerRef.current.style.opacity = `${opacity}`;
        containerRef.current.style.filter = blur > 0.1 ? `blur(${blur}px)` : "none";
        
        // Product enters from center below the viewport, horizontally centered
        containerRef.current.style.transform = `perspective(1800px) rotateX(${rotateX}deg) rotateY(0deg) scale(${scale}) translate3d(${shellParallaxX}px, ${translateY + shellParallaxY}px, 0)`;

        // Update pointer-events interaction once product is settled
        containerRef.current.style.pointerEvents = scroll >= 0.65 ? "auto" : "none";

        // Push mouse coordinates for inner UI elements parallax transforms
        containerRef.current.style.setProperty("--mouse-x", `${mouse.x}`);
        containerRef.current.style.setProperty("--mouse-y", `${mouse.y}`);
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, scrollProgressRef, mouseRef]);

  // Default initial styles for SSR / static render before mount
  const initialStyle = prefersReducedMotion 
    ? { opacity: 1.0, transform: "perspective(1800px) rotateX(0.5deg) rotateY(0deg) scale(1.0) translate3d(0px, 0px, 0)" }
    : { opacity: 0.05, filter: "blur(10px)", transform: "perspective(1800px) rotateX(4deg) rotateY(0deg) scale(0.86) translate3d(0px, 140px, 0)" };

  return (
    <div
      ref={containerRef}
      style={{
        ...initialStyle,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88vw] max-w-[1380px] h-[68vh] max-h-[720px] min-h-[560px] select-none transition-all duration-300"
    >
      <ProductShell />
    </div>
  );
};

export default ProductSurface;
