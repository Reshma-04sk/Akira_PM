import { useEffect, useRef } from "react";

export const useMousePosition = () => {
  const mousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePositionRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePositionRef;
};

export default useMousePosition;
