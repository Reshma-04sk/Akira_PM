import React, { useEffect, useRef, useState } from "react";

interface StatItemProps {
  target: number;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ target, label }) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const duration = 1200;
            const start = performance.now();

            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setCount(Math.round(eased * target));

              if (p < 1) {
                requestAnimationFrame(tick);
              } else {
                setCount(target);
              }
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="bg-[#131316] p-8 text-center select-none">
      <div className="font-serif text-4xl md:text-5xl text-[#ff4d2e] mb-1.5 font-normal tracking-tight">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-[#8b8a90] font-sans">{label}</div>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="w-full max-w-[900px] mx-auto my-32 px-6 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#26262b] border border-[#26262b] rounded-2xl overflow-hidden shadow-2xl">
        <StatItem target={42} label="Hours saved per sprint" />
        <StatItem target={3200} label="Teams building on Akira" />
        <StatItem target={99} label="Uptime, last 12 months" />
        <StatItem target={6} label="Minutes to first board" />
      </div>
    </section>
  );
};

export default StatsSection;
