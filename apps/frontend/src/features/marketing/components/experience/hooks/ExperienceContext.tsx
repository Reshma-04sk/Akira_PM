import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";

interface ExperienceContextType {
  scrollProgress: number; // Reactive state for HTML
  scrollProgressRef: React.MutableRefObject<number>; // High-performance ref for WebGL
  mouseX: number; // Reactive state
  mouseY: number; // Reactive state
  mouseRef: React.MutableRefObject<{ x: number; y: number }>; // High-performance ref
  prefersReducedMotion: boolean;
}

const ExperienceContext = createContext<ExperienceContextType | null>(null);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let currentScroll = 0;
    let targetScroll = 0;

    const currentMouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    let frameId: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1 range
      targetMouse = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const update = () => {
      // Smooth damping (0.07) for buttery cinematic transition
      currentScroll += (targetScroll - currentScroll) * 0.07;
      
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.07;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.07;

      // Update WebGL high-performance refs directly
      scrollProgressRef.current = currentScroll;
      mouseRef.current = { x: currentMouse.x, y: currentMouse.y };

      // Update state for DOM elements
      setScrollProgress(currentScroll);
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

  return (
    <ExperienceContext.Provider
      value={{
        scrollProgress,
        scrollProgressRef,
        mouseX: mouse.x,
        mouseY: mouse.y,
        mouseRef,
        prefersReducedMotion,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used within ExperienceProvider");
  return ctx;
};

export default ExperienceContext;
