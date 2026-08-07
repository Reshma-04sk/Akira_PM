import { useEffect, useRef } from "react";

export const useScrollProgress = () => {
  const scrollProgressRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      scrollProgressRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger initially
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollProgressRef;
};

export default useScrollProgress;
