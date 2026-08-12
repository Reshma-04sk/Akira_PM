import React, { useEffect, useRef } from "react";

export const CursorTrailCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animId: number;
    let points: Array<{ x: number; y: number; life: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > 40) points.shift();
    };

    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.life -= 0.035;
        if (p.life <= 0) continue;
        const next = points[i + 1];
        if (!next) continue;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `rgba(255, 77, 46, ${p.life * 0.5})`;
        ctx.lineWidth = p.life * 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      points = points.filter((p) => p.life > 0);
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="trail"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default CursorTrailCanvas;
