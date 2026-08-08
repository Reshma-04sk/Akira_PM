import { useEffect, useState } from "react";

export const useScrollValue = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    let current = 0;
    let target = 0;
    let frameId: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      target = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const update = () => {
      // Damped interpolation factor (0.09) for buttery smooth cinema feel
      current += (target - current) * 0.09;
      
      if (Math.abs(target - current) > 0.0001) {
        setScroll(current);
      } else {
        setScroll(target);
      }
      frameId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return scroll;
};

export default useScrollValue;
