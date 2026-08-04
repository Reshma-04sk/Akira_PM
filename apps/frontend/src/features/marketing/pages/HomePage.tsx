import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const InteractiveBackground = lazy(() => import("../components/InteractiveBackground"));

const viewportContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    }
  }
};

const textFadeVariants = {
  hidden: { opacity: 0, y: 35, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1] // Luxury cubic bezier ease-out
    }
  }
};

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07060a]">
      {/* 3D WebGL Canvas Layer */}
      <Suspense fallback={<div className="absolute inset-0 -z-10 bg-[#07060a]" />}>
        <InteractiveBackground />
      </Suspense>

      {/* FIXED BACKGROUND GRADIENTS SWITCHER TIED TO VIEWPORTS */}
      <div className="fixed inset-0 pointer-events-none -z-10 mix-blend-screen opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-radial from-[#d4af37]/10 to-transparent filter blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-radial from-[#8a6b1f]/10 to-transparent filter blur-[100px]" />
      </div>

      {/* VIEWPORT 1: HERO */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10 select-none">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          className="text-center space-y-8 flex flex-col items-center pointer-events-none"
        >
          <motion.span 
            variants={textFadeVariants}
            className="inline-block text-[12px] font-bold tracking-[3px] uppercase text-[#f3dfa0] border border-[#d4af37]/35 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(212, 175, 55, 0.05)" }}
          >
            Introducing Akira PM
          </motion.span>

          <motion.h1 
            variants={textFadeVariants}
            className="font-serif font-normal text-4xl sm:text-7xl tracking-[-0.5px] leading-[1.08] text-center"
            style={{
              background: "linear-gradient(180deg, #ffffff, #f3dfa0 120%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Project Management.<br />Refined.
          </motion.h1>

          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed font-medium"
          >
            Sprints, backlogs, and roadmaps in an interface that respects your focus. Built for teams who move fast.
          </motion.p>

          <motion.div 
            variants={textFadeVariants}
            className="flex items-center justify-center gap-4 flex-wrap pointer-events-auto pt-2"
          >
            <Link to="/register">
              <button 
                type="button"
                className="px-8 py-3.5 text-[13px] font-bold tracking-[0.5px] rounded-full text-[#1a1206] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #f3dfa0, #d4af37 60%, #8a6b1f)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.25)"
                }}
              >
                Start free trial
              </button>
            </Link>
            <Link to="/features">
              <button 
                type="button"
                className="glass-button px-8 py-3.5 text-[13px] font-bold tracking-[0.5px] rounded-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Watch the demo
              </button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll hint indicator */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-[10px] tracking-[3px] uppercase text-[#9a938a] font-black">
          Scroll
          <div className="w-[1px] h-[34px] overflow-hidden relative bg-white/10">
            <div 
              className="absolute left-0 right-0 w-full bg-[#f3dfa0]"
              style={{
                height: "15px",
                animation: "scrollmove 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </section>

      {/* VIEWPORT 2: DEVELOPERS */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20%" }}
          className="text-center space-y-6"
        >
          <motion.span variants={textFadeVariants} className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">
            Core philosophy
          </motion.span>
          <motion.h2 
            variants={textFadeVariants}
            className="font-serif font-normal text-3xl sm:text-6xl text-foreground tracking-[-0.5px] leading-tight"
          >
            Built for Developers.
          </motion.h2>
          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[13px] sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            Command key navigation layouts, structured API endpoints, and clean visual densities constructed to flow at the speed of thought.
          </motion.p>
        </motion.div>
      </section>

      {/* VIEWPORT 3: SPEED */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10 bg-[#0d0b10]/20">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20%" }}
          className="text-center space-y-6"
        >
          <motion.span variants={textFadeVariants} className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">
            Zero friction
          </motion.span>
          <motion.h2 
            variants={textFadeVariants}
            className="font-serif font-normal text-3xl sm:text-6xl text-[#f3dfa0] tracking-[-0.5px] leading-tight"
          >
            Designed for Speed.
          </motion.h2>
          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[13px] sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            Integrated client-side states, sub-millisecond cache refreshes, and structured endpoints ensure zero rendering delays.
          </motion.p>
        </motion.div>
      </section>

      {/* VIEWPORT 4: ONE WORKSPACE */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20%" }}
          className="text-center space-y-6"
        >
          <motion.span variants={textFadeVariants} className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">
            Consolidated tools
          </motion.span>
          <motion.h2 
            variants={textFadeVariants}
            className="font-serif font-normal text-3xl sm:text-6xl text-foreground tracking-[-0.5px] leading-tight"
          >
            One Workspace.<br />Infinite Possibilities.
          </motion.h2>
          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[13px] sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            Bring backlogs, sprints, roadmaps, members management, and task comments threads under a unified visual umbrella.
          </motion.p>
        </motion.div>
      </section>

      {/* VIEWPORT 5: EVERY MILESTONE */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10 bg-[#0d0b10]/20">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20%" }}
          className="text-center space-y-6"
        >
          <motion.span variants={textFadeVariants} className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">
            Absolute alignment
          </motion.span>
          <motion.h2 
            variants={textFadeVariants}
            className="font-serif font-normal text-2xl sm:text-5xl text-[#f3dfa0] tracking-[-0.5px] leading-snug"
          >
            Every Sprint. Every Task.<br />Every Milestone. Connected.
          </motion.h2>
          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[13px] sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            Task state changes seamlessly bubble up to metric cards, SVG statistics, team workloads, and recent audit trails.
          </motion.p>
        </motion.div>
      </section>

      {/* VIEWPORT 6: NO CLUTTER */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10">
        <motion.div
          variants={viewportContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20%" }}
          className="text-center space-y-6"
        >
          <motion.span variants={textFadeVariants} className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">
            Visual focus
          </motion.span>
          <motion.h2 
            variants={textFadeVariants}
            className="font-serif font-normal text-3xl sm:text-6xl text-foreground tracking-[-0.5px] leading-tight"
          >
            No clutter. Only focus.
          </motion.h2>
          <motion.p 
            variants={textFadeVariants}
            className="text-[#9a938a] text-[13px] sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            Say goodbye to visual bloat and excessive grids. Experience a layout optimized to let your coding team do what they do best.
          </motion.p>
        </motion.div>
      </section>

      {/* VIEWPORT 7: DRAMATIC DASHBOARD REVEAL */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center py-20 px-6 sm:px-8 relative z-10 bg-[#0d0b10]">
        <div className="max-w-5xl mx-auto w-full text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-[4px] text-[#d4af37]">Experience Akira PM</span>
            <h2 className="font-serif font-normal text-3xl sm:text-5xl text-[#f3dfa0]">A preview of focus</h2>
          </motion.div>

          {/* Scale & Blur Parallax Reveal Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82, filter: "blur(20px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white/5 px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs text-[#9a938a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[9px] tracking-wider">akira-pm-shell (v2.1.0)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] font-bold text-[9px] uppercase tracking-widest border border-[#d4af37]/20">Active Session</span>
            </div>
            
            <div className="p-4 sm:p-6 bg-black/20">
              <img
                src="/assets/preview_dashboard.webp"
                alt="Akira Dashboard Workspace Preview"
                width={1200}
                height={650}
                className="w-full object-cover rounded-xl shadow-md border border-white/5 max-h-[520px]"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* VIEWPORT 8: CINEMATIC CALL-TO-ACTION */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-6 relative z-10 bg-[#07060a]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="cta-panel max-w-2xl mx-auto w-full p-12 rounded-3xl glass-panel relative overflow-hidden"
        >
          {/* Inner ambient glow background */}
          <div className="absolute inset-0 bg-radial from-[#d4af37]/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
            <h2 className="font-serif font-normal text-3xl sm:text-5xl text-foreground">See your first sprint board in minutes</h2>
            <p className="text-[#9a938a] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Start free, invite your team, and import your existing backlog. No credit card required.
            </p>
            <Link to="/register">
              <button 
                type="button"
                className="px-8 py-3.5 text-[13px] font-bold tracking-[0.5px] rounded-full text-[#1a1206] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #f3dfa0, #d4af37 60%, #8a6b1f)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.25)"
                }}
              >
                Start free trial
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Scroll animation keyframes style wrapper */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollmove {
          0% { top: -15px; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 34px; opacity: 0; }
        }
      `}} />
    </div>
  );
};
