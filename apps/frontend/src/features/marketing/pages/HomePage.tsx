import React, { useRef, useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { KanbanBoard } from "../components/KanbanBoard";
import { AkiraScene } from "../components/scene/AkiraScene";

/* ────────────────── helpers ────────────────── */

const useScrollProgress = () => {
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return { scrollRef, mouseRef };
};

/* Magnetic button — cursor attracts button on hover */
const MagneticButton = memo(({ children, to, className, style, onClick }: {
  children: React.ReactNode;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => {
  const btnRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const handleMouseLeave = () => {
    if (btnRef.current) btnRef.current.style.transform = "translate(0,0)";
  };

  const inner = (
    <motion.div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{ transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)", ...style }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
});
MagneticButton.displayName = "MagneticButton";

/* AI typewriter */
const AI_PROMPTS = [
  { q: "Generate Sprint", a: ["Sprint 12 created", "8 tasks assigned", "Goals aligned"] },
  { q: "Summarize Meeting", a: ["3 action items found", "2 blockers identified", "Next sync: Fri"] },
  { q: "Break down Story", a: ["Story split into 5", "Estimated: 13 pts", "Owner: CK"] },
  { q: "Find Risks", a: ["2 critical blockers", "1 dependency lag", "1 scope creep risk"] },
];

const AITypewriter = memo(() => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const prompt = AI_PROMPTS[promptIdx].q;
    let i = 0;
    setTyped("");
    setShowCards(false);
    const interval = setInterval(() => {
      i++;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) {
        clearInterval(interval);
        setTimeout(() => setShowCards(true), 300);
        setTimeout(() => {
          setPromptIdx((p) => (p + 1) % AI_PROMPTS.length);
        }, 3000);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [promptIdx]);

  const current = AI_PROMPTS[promptIdx];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Input row */}
      <div className="flex items-center gap-3 bg-white/[0.05] border border-[#d4af37]/30 rounded-xl px-4 py-3 backdrop-blur-md">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#f3dfa0,#d4af37)" }}>
          <span className="text-[#1a1206] text-[10px] font-black">A</span>
        </div>
        <span className="text-[#f3efe6] text-sm font-mono flex-1">
          {typed}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            className="inline-block w-0.5 h-3.5 bg-[#d4af37] ml-0.5 align-middle"
          />
        </span>
      </div>

      {/* Result cards */}
      <AnimatePresence>
        {showCards && (
          <motion.div className="space-y-2">
            {current.a.map((item, i) => (
              <motion.div
                key={`${promptIdx}-${i}`}
                initial={{ opacity: 0, y: 12, x: -8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                <span className="text-[12px] text-[#f3efe6] font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
AITypewriter.displayName = "AITypewriter";

/* Animated counter */
const Counter = memo(({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
});
Counter.displayName = "Counter";

/* Section wrapper with IntersectionObserver */
const Section = memo(({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} data-visible={visible} className={`relative z-10 ${className}`}>
      {children}
    </section>
  );
});
Section.displayName = "Section";

/* Shared text animation variants */
const reveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* Architecture node */
const ArchNode = memo(({ label, x, y, delay }: { label: string; x: string; y: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
    style={{ left: x, top: y }}
  >
    <motion.div
      animate={{ boxShadow: ["0 0 8px #d4af3740", "0 0 18px #d4af3780", "0 0 8px #d4af3740"] }}
      transition={{ repeat: Infinity, duration: 2.5, delay }}
      className="w-10 h-10 rounded-xl bg-white/[0.05] border border-[#d4af37]/40 backdrop-blur flex items-center justify-center"
    >
      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
    </motion.div>
    <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a938a] text-center leading-tight">
      {label}
    </span>
  </motion.div>
));
ArchNode.displayName = "ArchNode";

/* ────────────────── Main Component ────────────────── */

export const HomePage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const { scrollRef, mouseRef } = useScrollProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  /* Fog opacity tied to scroll — fades out as user enters chapter 2 */
  const fogOpacity = useTransform(scrollYProgress, [0, 0.12], [0.8, 0]);

  const ARCH_NODES = [
    { label: "Workspace", x: "50%", y: "15%", delay: 0 },
    { label: "Projects", x: "25%", y: "35%", delay: 0.1 },
    { label: "Tasks", x: "75%", y: "35%", delay: 0.2 },
    { label: "Calendar", x: "15%", y: "60%", delay: 0.3 },
    { label: "Reports", x: "40%", y: "65%", delay: 0.4 },
    { label: "Teams", x: "65%", y: "65%", delay: 0.5 },
    { label: "AI", x: "85%", y: "60%", delay: 0.6 },
    { label: "Notifications", x: "50%", y: "88%", delay: 0.7 },
  ];

  return (
    <div
      ref={containerRef}
      className="relative text-[#f3efe6] antialiased bg-transparent"
    >
      {/* Fixed bottom background layer to avoid hiding the canvas */}
      <div className="fixed inset-0 -z-20 bg-[#07060a]" />

      {/* ── Persistent R3F Canvas (fixed, behind everything) ── */}
      <AkiraScene scrollProgress={scrollRef} mouseRef={mouseRef} />

      {/* ── CSS Volumetric Fog (Ch1 only) ── */}
      <motion.div
        style={{ opacity: fogOpacity }}
        className="fixed inset-0 -z-9 pointer-events-none"
      >
        <div className="absolute inset-0 bg-radial-[at_50%_60%] from-[#0d0b10]/80 via-transparent to-transparent" />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(212,175,55,0.04) 0%,transparent 70%)", filter: "blur(40px)" }}
        />
      </motion.div>

      {/* ═══════════════════════════════════
          CHAPTER 1 — THE VOID
      ═══════════════════════════════════ */}
      <Section className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="text-center space-y-8 max-w-3xl mx-auto"
        >
          {/* Golden eyebrow */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 2, delay: 1 }}
            className="text-[11px] font-bold uppercase text-[#d4af37] tracking-[0.3em]"
          >
            Akira PM
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-normal text-5xl sm:text-7xl leading-[1.04] tracking-[-1px]"
            style={{
              background: "linear-gradient(180deg,#ffffff 0%,#f3dfa0 60%,#d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Project Management,{" "}<br className="hidden sm:block" />Refined.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#9a938a] text-base max-w-md mx-auto leading-relaxed"
          >
            The operating system for modern engineering teams.
            Built for velocity. Designed for clarity.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.4 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <MagneticButton
              to="/register"
              className="px-8 py-3.5 text-[13px] font-bold tracking-wide rounded-full text-[#1a1206] cursor-pointer"
              style={{
                background: "linear-gradient(135deg,#f3dfa0,#d4af37 60%,#8a6b1f)",
                boxShadow: "0 0 30px rgba(212,175,55,0.3)",
              } as React.CSSProperties}
            >
              Start Building →
            </MagneticButton>
            <MagneticButton
              to="/features"
              className="px-8 py-3.5 text-[13px] font-bold tracking-wide rounded-full text-[#f3efe6] border border-white/20 hover:border-[#d4af37]/50 cursor-pointer transition-colors backdrop-blur-sm"
            >
              Watch the story
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[3px] uppercase text-[#9a938a] font-bold"
        >
          <span>Scroll</span>
          <div className="w-px h-8 overflow-hidden relative bg-white/10">
            <motion.div
              animate={{ y: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-full h-1/2 bg-[#d4af37]"
            />
          </div>
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 2 — THE ECLIPSE
      ═══════════════════════════════════ */}
      <Section className="h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-2xl space-y-6">
          <motion.span
            custom={0} variants={reveal} initial="hidden" whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]"
          >
            The operating system
          </motion.span>
          <motion.h2
            custom={1} variants={reveal} initial="hidden" whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            className="font-serif font-normal text-4xl sm:text-6xl leading-tight tracking-[-0.5px] text-white"
          >
            Built for Developers.
          </motion.h2>
          <motion.p
            custom={2} variants={reveal} initial="hidden" whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            className="text-[#9a938a] text-sm max-w-sm mx-auto leading-relaxed"
          >
            Every keystroke, every commit, every deployment — tracked and surfaced precisely when your team needs it.
          </motion.p>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 3 — ASSEMBLY (Glass UI)
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              The Interface
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              Assembling itself.
            </motion.h2>
          </div>

          {/* Glass UI shell assembling */}
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-[#d4af37]/20 shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
            style={{ background: "rgba(7,6,10,0.7)", backdropFilter: "blur(24px)" }}
          >
            {/* Navbar assembles from top */}
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between px-5 py-3 border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg"
                  style={{ background: "linear-gradient(135deg,#f3dfa0,#d4af37)" }} />
                <span className="text-[11px] font-serif text-[#f3dfa0] tracking-wider">Akira PM</span>
              </div>
              {/* Workspace selector */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#9a938a] font-medium"
              >
                <div className="w-2 h-2 rounded-sm bg-[#d4af37]" />
                Akira Workspace
                <svg className="w-3 h-3 text-[#9a938a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
              {/* Search + Avatar */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#9a938a]"
                  style={{ transformOrigin: "right" }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search...
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono">⌘K</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: -20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-[#1a1206] shrink-0"
                  style={{ background: "linear-gradient(135deg,#f3dfa0,#d4af37)" }}
                >
                  CK
                </motion.div>
              </div>
            </motion.div>

            <div className="flex min-h-[280px]">
              {/* Sidebar slides from left */}
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false, margin: "-10%" }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-40 border-r border-white/5 p-3 flex flex-col gap-1"
              >
                {["Dashboard", "Projects", "Tasks", "Calendar", "Reports", "Teams", "Settings"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-default ${
                      item === "Tasks" ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25" : "text-[#9a938a] hover:text-[#f3efe6]"
                    }`}
                  >
                    <div className={`w-1 h-1 rounded-full ${item === "Tasks" ? "bg-[#d4af37]" : "bg-white/20"}`} />
                    {item}
                  </motion.div>
                ))}
              </motion.div>

              {/* Main content area */}
              <div className="flex-1 p-5 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-[#f3efe6]">Sprint 12 — Q4 2026</span>
                  <div className="flex gap-2">
                    {["board", "list", "timeline"].map((v) => (
                      <span key={v}
                        className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider cursor-default ${
                          v === "board" ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25" : "text-[#9a938a] bg-white/5"
                        }`}>
                        {v}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Mini stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Sprint Progress", val: "78%", color: "#10b981" },
                    { label: "Open Tasks", val: "24", color: "#d4af37" },
                    { label: "Velocity", val: "42 pts", color: "#8b5cf6" },
                  ].map(({ label, val, color }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.88, y: 16 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 240 }}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-3"
                    >
                      <p className="text-[9px] text-[#9a938a] mb-1 uppercase tracking-wide">{label}</p>
                      <p className="text-base font-black" style={{ color }}>{val}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 4 — KANBAN REVEAL
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-15%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              The Heart of Akira
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-15%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              Every task. Alive.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <KanbanBoard />
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 5 — LIVE PRODUCT
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              Zero friction
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Designed for Speed.
            </motion.h2>
          </div>

          {/* Live metric counters */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Sprint Health", target: 87, suffix: "%" },
              { label: "Open Tasks", target: 24, suffix: "" },
              { label: "Velocity", target: 42, suffix: "pts" },
            ].map(({ label, target, suffix }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.15 }}
                className="space-y-2"
              >
                <div className="text-4xl sm:text-5xl font-black font-serif text-[#d4af37]">
                  <Counter target={target} suffix={suffix} />
                </div>
                <div className="text-[11px] text-[#9a938a] uppercase tracking-widest font-bold">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Animated SVG chart */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
          >
            <p className="text-[11px] text-[#9a938a] uppercase tracking-widest mb-4 text-left">Sprint Burndown</p>
            <svg viewBox="0 0 400 100" className="w-full h-20">
              <motion.polyline
                points="0,85 50,70 100,60 150,55 200,42 250,35 300,20 350,12 400,5"
                fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
              />
              <motion.polyline
                points="0,85 50,80 100,75 150,72 200,65 250,60 300,55 350,48 400,42"
                fill="none" stroke="#ffffff20" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4"
              />
            </svg>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 6 — COMMAND CENTER
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-5xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              Command Center
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              One Workspace.<br />Infinite Insight.
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Velocity chart */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <p className="text-[11px] text-[#9a938a] uppercase tracking-widest font-bold">Team Velocity</p>
              <div className="flex items-end gap-2 h-20">
                {[42, 38, 55, 48, 62, 57, 70].map((h, i) => (
                  <motion.div
                    key={i} className="flex-1 rounded-sm"
                    style={{ background: i === 6 ? "#d4af37" : `rgba(212,175,55,${0.2 + i * 0.08})` }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                    custom={{ height: `${h}%`, transformOrigin: "bottom" }}
                  />
                ))}
              </div>
              <p className="text-xl font-black text-[#d4af37]">70 pts <span className="text-xs text-[#10b981] font-bold">↑ 23%</span></p>
            </motion.div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <p className="text-[11px] text-[#9a938a] uppercase tracking-widest font-bold">Activity Heatmap</p>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7,1fr)" }}>
                {Array.from({ length: 35 }, (_, i) => {
                  const intensity = Math.random();
                  return (
                    <motion.div
                      key={i}
                      className="aspect-square rounded-sm"
                      style={{ background: intensity > 0.7 ? "#d4af37" : intensity > 0.4 ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.05)" }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.3 + i * 0.015 }}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* Task donut */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <p className="text-[11px] text-[#9a938a] uppercase tracking-widest font-bold">Task Distribution</p>
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0 -rotate-90">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <motion.circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="10"
                    strokeDasharray={`${188 * 0.45} ${188 * 0.55}`} strokeDashoffset={0}
                    initial={{ strokeDasharray: "0 188" }}
                    whileInView={{ strokeDasharray: `${188 * 0.45} ${188 * 0.55}` }}
                    viewport={{ once: false }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                  />
                  <motion.circle cx="40" cy="40" r="30" fill="none" stroke="#d4af37" strokeWidth="10"
                    strokeDasharray={`${188 * 0.3} ${188 * 0.7}`}
                    strokeDashoffset={`${-188 * 0.45}`}
                    initial={{ strokeDasharray: "0 188" }}
                    whileInView={{ strokeDasharray: `${188 * 0.3} ${188 * 0.7}` }}
                    viewport={{ once: false }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                  />
                </svg>
                <div className="space-y-2">
                  {[{ l: "Done", c: "#10b981", v: "45%" }, { l: "In Progress", c: "#d4af37", v: "30%" }, { l: "Todo", c: "#6b7280", v: "25%" }].map((item) => (
                    <div key={item.l} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.c }} />
                      <span className="text-[10px] text-[#9a938a]">{item.l}</span>
                      <span className="text-[10px] font-bold text-[#f3efe6] ml-auto">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Timeline mini */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <p className="text-[11px] text-[#9a938a] uppercase tracking-widest font-bold">Sprint Timeline</p>
              <div className="space-y-2.5">
                {[
                  { task: "Auth Refactor", pct: 100, color: "#10b981" },
                  { task: "3D Landing", pct: 78, color: "#d4af37" },
                  { task: "WebSocket", pct: 45, color: "#3b82f6" },
                  { task: "Redis Cache", pct: 12, color: "#6b7280" },
                ].map(({ task, pct, color }, i) => (
                  <div key={task} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#9a938a]">{task}</span>
                      <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 7 — AI ASSISTANT
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              AI Native
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              Your project intelligence.
            </motion.h2>
            <motion.p custom={2} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[#9a938a] text-sm">
              Akira understands your team, your sprints, your velocity.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <AITypewriter />
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 8 — REAL TIME
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              Always In Sync
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              Every Sprint. Every Task.<br />Every Milestone. Connected.
            </motion.h2>
          </div>

          {/* Live presence indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5"
          >
            {/* Online members */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["CK", "RS", "PK", "MJ"].map((initials, i) => (
                  <motion.div key={initials}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="relative w-7 h-7 rounded-full border-2 border-[#07060a] flex items-center justify-center text-[8px] font-black text-[#1a1206]"
                    style={{ background: "linear-gradient(135deg,#f3dfa0,#d4af37)", zIndex: 4 - i }}
                  >
                    {initials}
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] border border-[#07060a]"
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-[11px] text-[#9a938a]">4 members online</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-auto text-[10px] font-bold text-[#10b981] flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                LIVE
              </motion.span>
            </div>

            {/* Typing indicators */}
            {["RS is editing Kanban story...", "PK is reviewing auth PR..."].map((msg, i) => (
              <motion.div key={msg}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.6 + i * 0.2 }}
                className="flex items-center gap-3 text-[11px] text-[#9a938a]"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div key={dot}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: dot * 0.15 }}
                      className="w-1 h-1 rounded-full bg-[#d4af37]"
                    />
                  ))}
                </div>
                {msg}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 9 — ENTERPRISE ARCHITECTURE
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <motion.span custom={0} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
              Enterprise Ready
            </motion.span>
            <motion.h2 custom={1} variants={reveal} initial="hidden" whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight">
              No clutter. Only focus.
            </motion.h2>
          </div>

          {/* Architecture SVG graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.7 }}
            className="relative h-72 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* SVG connecting lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 280" preserveAspectRatio="none">
              {[
                [200, 42, 100, 98], [200, 42, 300, 98],
                [100, 98, 60, 168], [100, 98, 160, 182],
                [300, 98, 260, 182], [300, 98, 340, 168],
                [160, 182, 200, 246], [260, 182, 200, 246],
              ].map(([x1, y1, x2, y2], i) => (
                <motion.line key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#d4af37" strokeWidth="0.8" strokeOpacity={0.4}
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, strokeOpacity: 0 }}
                  whileInView={{ pathLength: 1, strokeOpacity: 0.4 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.6 }}
                />
              ))}
            </svg>

            {/* Nodes */}
            {ARCH_NODES.map((node) => (
              <ArchNode key={node.label} {...node} />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
          CHAPTER 10 — FINAL CTA
      ═══════════════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-15%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-2xl mx-auto w-full text-center rounded-3xl p-12 sm:p-16 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.3)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Ambient inner glow */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(212,175,55,0.3) 0%,transparent 70%)", filter: "blur(30px)" }}
            />
          </div>

          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
              viewport={{ once: false }}
              transition={{ duration: 1.5 }}
              className="text-[10px] font-bold uppercase text-[#d4af37] tracking-[0.3em]"
            >
              The Future Is Now
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-normal text-3xl sm:text-5xl leading-tight"
              style={{
                background: "linear-gradient(180deg,#ffffff,#f3dfa0 80%,#d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              The future of project management starts here.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.5 }}
              className="text-[#9a938a] text-sm leading-relaxed max-w-md mx-auto"
            >
              Start free. No credit card. Invite your team in 30 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            >
              <MagneticButton
                to="/register"
                className="inline-block px-10 py-4 text-[14px] font-black tracking-wide rounded-full text-[#1a1206] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#f3dfa0,#d4af37 60%,#8a6b1f)",
                  boxShadow: "0 0 40px rgba(212,175,55,0.35), 0 8px 32px rgba(0,0,0,0.5)",
                } as React.CSSProperties}
              >
                Start Building →
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* Footer spacer */}
      <div className="h-24" />

      {/* ── Reduced motion global override ── */}
      {prefersReduced && (
        <style dangerouslySetInnerHTML={{ __html: `*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }` }} />
      )}
    </div>
  );
};
