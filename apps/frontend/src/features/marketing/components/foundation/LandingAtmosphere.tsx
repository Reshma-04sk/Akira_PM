import React, { useEffect, useRef } from "react";

export const LandingAtmosphere: React.FC = () => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${pct})`;
      }

      if (meshRef.current) {
        meshRef.current.style.transform = `translateY(${scrollTop * 0.25}px)`;
        meshRef.current.style.opacity = String(Math.max(0.15, 0.5 - pct * 0.4));
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        ref={progressBarRef}
        id="progressBar"
        className="fixed top-0 left-0 h-[2px] w-full bg-[#ff4d2e] origin-left z-50 pointer-events-none"
        style={{ transform: "scaleX(0)" }}
      />

      {/* Blurred orange radial mesh */}
      <div
        ref={meshRef}
        id="mesh"
        className="fixed top-[-20%] left-1/2 w-[900px] h-[900px] ml-[-450px] pointer-events-none z-0 opacity-50 blur-[10px]"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 77, 46, 0.14), transparent 60%)",
        }}
      />

      {/* 28 Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-white/25"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default LandingAtmosphere;
