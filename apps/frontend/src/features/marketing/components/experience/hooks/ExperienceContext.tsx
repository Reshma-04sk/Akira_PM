import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";

// 1. Reactive State Context (For DOM elements that reactively render on scroll/mouse changes)
interface ExperienceStateType {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

const ExperienceStateContext = createContext<ExperienceStateType | null>(null);

// 2. High-Performance Refs Context (For R3F WebGL elements to avoid React re-renders)
interface ExperienceRefType {
  scrollProgressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  prefersReducedMotion: boolean;
}

const ExperienceRefContext = createContext<ExperienceRefType | null>(null);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const currentMouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    let frameId: number;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const totalHeroRange = window.innerHeight * 2.0;
      const progress = Math.min(1, Math.max(0, scrollY / totalHeroRange));
      
      scrollProgressRef.current = progress;
      setScrollProgress(progress);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const update = () => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.07;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.07;

      // Update WebGL high-performance refs directly (does not trigger re-renders)
      mouseRef.current.x = currentMouse.x;
      mouseRef.current.y = currentMouse.y;

      // Update state for DOM elements
      setMouse({ x: currentMouse.x, y: currentMouse.y });

      frameId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    handleScroll();
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Stable Refs Context value object reference
  const refsValue = useMemo(() => ({
    scrollProgressRef,
    mouseRef,
    prefersReducedMotion
  }), [prefersReducedMotion]);

  // Reactive State Context value object reference
  const stateValue = useMemo(() => ({
    scrollProgress,
    mouseX: mouse.x,
    mouseY: mouse.y
  }), [scrollProgress, mouse.x, mouse.y]);

  return (
    <ExperienceRefContext.Provider value={refsValue}>
      <ExperienceStateContext.Provider value={stateValue}>
        {children}
      </ExperienceStateContext.Provider>
    </ExperienceRefContext.Provider>
  );
};

// Hook for HTML elements that need scroll/mouse state triggers
export const useExperienceState = () => {
  const ctx = useContext(ExperienceStateContext);
  if (!ctx) throw new Error("useExperienceState must be used within ExperienceProvider");
  return ctx;
};

// Hook for 3D R3F components that execute entirely inside useFrame loops
export const useExperienceRefs = () => {
  const ctx = useContext(ExperienceRefContext);
  if (!ctx) throw new Error("useExperienceRefs must be used within ExperienceProvider");
  return ctx;
};

// Maintain fallback useExperience for backwards compatibility
export const useExperience = () => {
  const stateCtx = useContext(ExperienceStateContext);
  const refCtx = useContext(ExperienceRefContext);
  if (!stateCtx || !refCtx) throw new Error("useExperience must be used within ExperienceProvider");
  return {
    ...stateCtx,
    ...refCtx
  };
};
