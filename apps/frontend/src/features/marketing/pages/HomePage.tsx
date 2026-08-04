import React, { useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Star, 
  Terminal, 
  Activity, 
  BarChart3, 
  Calendar as CalendarIcon,
  Shield,
  Zap,
  Database
} from "lucide-react";
const InteractiveBackground = lazy(() => import("../components/InteractiveBackground"));
import { Card } from "@/components/ui/data-display";

const FEATURE_HIGHLIGHTS = [
  {
    icon: Terminal,
    title: "Production Workspace Shell",
    desc: "Coordinate workspaces, teams, and resource access levels dynamically with enterprise RBAC control.",
  },
  {
    icon: Activity,
    title: "Interactive Kanban Boards",
    desc: "Drag-and-drop tasks to transition status, update assignees, and record real-time notifications.",
  },
  {
    icon: CalendarIcon,
    title: "Timeline & Calendar Scheduler",
    desc: "Plan sprints, reschedule deadlines via calendar cell drags, and deep dive task drawer threads.",
  },
  {
    icon: BarChart3,
    title: "Performance & Reports Hub",
    desc: "Track completed milestones, workload counts, SVG priority donuts, and download CSV/PDF logs.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Is Akira-PM suitable for large enterprise teams?",
    answer: "Yes. Akira-PM is engineered with Postgres connection pooling, Upstash Redis caching, and robust FastAPI middleware. It scales seamlessly to thousands of active project members.",
  },
  {
    question: "Can I self-host the application infrastructure?",
    answer: "Absolutely. We supply modular Dockerfiles and private cloud composer configurations allowing you to orchestrate resources on AWS, Google Cloud, or bare metal.",
  },
  {
    question: "How do the Reports and Calendar modules work?",
    answer: "Reports fetch and compile workspace status/workloads client-side with native SVG visual graphs. The Calendar features HTML5 drag listeners to update sprint targets instantly.",
  },
  {
    question: "What support SLA is provided under the Enterprise plan?",
    answer: "Enterprise tier subscribers receive 24/7 dedicated support engineers, custom database migration assistance, and dedicated Redis pooling guarantees.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Akira-PM's calendar drag scheduling saved us hours of planning. The FastAPI backend is blazingly fast.",
    author: "Elena Rostova",
    role: "VP of Engineering, Veloce Tech",
    rating: 5,
  },
  {
    quote: "Having custom SVG reports that print perfectly to PDF is an absolute lifesaver. We exported our monthly workspace audit in seconds.",
    author: "Marcus Chen",
    role: "Principal Product Officer, GridScale",
    rating: 5,
  },
  {
    quote: "The security setup with TrustedHost and JSON structured logging made compliance sign-off incredibly straightforward.",
    author: "Sarah Jenkins",
    role: "DevSecOps Lead, SecureFlow",
    rating: 5,
  },
];

export const HomePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-[#07060a]">
      {/* 3D background with scroll parallax */}
      <Suspense fallback={<div className="absolute inset-0 -z-10 bg-[#07060a]" />}>
        <InteractiveBackground />
      </Suspense>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6 space-y-8 select-none pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 flex flex-col items-center"
          >
            {/* Eyebrow Badge */}
            <span 
              className="inline-block text-[12px] font-bold tracking-[3px] uppercase text-[#f3dfa0] border border-[#d4af37]/35 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(212, 175, 55, 0.05)",
              }}
            >
              Introducing Akira PM
            </span>
            
            {/* Title - Luxury Georgia Font */}
            <h1 
              className="font-serif font-normal text-4xl sm:text-7xl tracking-[-0.5px] leading-[1.08] text-center"
              style={{
                background: "linear-gradient(180deg, #ffffff, #f3dfa0 120%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Project management,<br />refined.
            </h1>
            
            {/* Paragraph */}
            <p className="text-[#9a938a] text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
              Sprints, backlogs, and roadmaps in an interface that respects your focus. Built for teams who move fast without the clutter.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 flex-wrap pointer-events-auto"
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
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-[11px] tracking-[3px] uppercase text-[#9a938a] font-bold">
          Scroll
          <div 
            className="w-[1px] h-[34px] overflow-hidden relative"
            style={{
              background: "linear-gradient(#d4af37, transparent)",
            }}
          >
            <div 
              className="absolute left-0 right-0 w-full bg-[#f3dfa0]"
              style={{
                height: "15px",
                animation: "scrollmove 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* CSS Keyframe style for Scrollhint inline */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scrollmove {
            0% { top: -15px; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 34px; opacity: 0; }
          }
        `}} />
      </section>

      {/* Preview Section - App Screenshot Mockup */}
      <section className="py-20 px-6 sm:px-8 border-t border-white/5 bg-[#0d0b10] relative z-20">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-serif font-normal text-3xl sm:text-5xl text-[#f3dfa0]">A command center for builders</h2>
            <p className="text-[#9a938a] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Explore a developer-first interface structured around speed, shortcuts, keyboard escape routes, and data validation rules.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white/5 px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs text-[#9a938a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[9px] tracking-wider text-muted-foreground">akira-pm-shell (v2.0.0)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] font-bold text-[9px] uppercase tracking-widest border border-[#d4af37]/20">Active Session</span>
            </div>
            
            <div className="p-4 sm:p-6 bg-black/25">
              <img
                src="/assets/preview_dashboard.webp"
                alt="Akira Dashboard Workspace Preview"
                width={1200}
                height={650}
                className="w-full object-cover rounded-xl shadow-md border border-white/5 max-h-[500px]"
                onError={(e) => {
                  // Fallback to placeholder if not loaded yet
                  e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Refined Features Motifs Section */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto grid md:grid-cols-3 gap-8 relative z-20" id="features">
        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel rounded-[20px] p-10 flex flex-col gap-6"
        >
          {/* Capsule Motif */}
          <div 
            className="w-11 h-[88px] rounded-full border border-[#d4af37]/40"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(212,175,55,0.08))"
            }}
          />
          <h3 className="font-serif text-[20px] font-normal text-[#f3dfa0]">Sprints</h3>
          <p className="text-[#9a938a] text-[14px] leading-relaxed">
            Plan, track, and close sprints on one board. Every task carries its project, assignee, and priority at a glance.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel rounded-[20px] p-10 flex flex-col gap-6"
        >
          {/* Cylinder Motif */}
          <div 
            className="w-[70px] h-[60px] rounded-lg"
            style={{
              background: "linear-gradient(135deg, #f3dfa0, #d4af37 55%, #8a6b1f)"
            }}
          />
          <h3 className="font-serif text-[20px] font-normal text-[#f3dfa0]">Roadmaps</h3>
          <p className="text-[#9a938a] text-[14px] leading-relaxed">
            See the whole quarter without leaving the app. Timelines built from the same tasks your team already updates.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel rounded-[20px] p-10 flex flex-col gap-6"
        >
          {/* Torus Motif */}
          <div 
            className="w-[70px] h-[70px] rounded-full border-[14px] border-[#d4af37]/35 bg-transparent"
          />
          <h3 className="font-serif text-[20px] font-normal text-[#f3dfa0]">Backlog</h3>
          <p className="text-[#9a938a] text-[14px] leading-relaxed">
            Nothing gets lost. Every idea has a home until it's ready to move, with full history from creation to done.
          </p>
        </motion.div>
      </section>

      {/* Tech Specifications */}
      <section className="py-20 px-6 sm:px-8 border-y border-white/5 bg-[#0d0b10] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#d4af37]">Designed for Scale</h2>
            <p className="text-2xl sm:text-3xl font-serif text-[#f3dfa0]">Agile infrastructure built to perform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-white/5 bg-[#07060a] rounded-2xl flex flex-col gap-4">
              <span className="h-10 w-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20">
                <Zap className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-foreground">Sub-Millisecond Cache</h3>
              <p className="text-[11px] text-[#9a938a] leading-relaxed">
                Aggregated service APIs with local state caching ensure pages load immediately without query blocking.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#07060a] rounded-2xl flex flex-col gap-4">
              <span className="h-10 w-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20">
                <Database className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-foreground">Supabase Prepared</h3>
              <p className="text-[11px] text-[#9a938a] leading-relaxed">
                Connect your workspace schema to remote instances. Enjoy flexible synchronization setups.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#07060a] rounded-2xl flex flex-col gap-4">
              <span className="h-10 w-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20">
                <Shield className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-foreground">Audited RBAC Shield</h3>
              <p className="text-[11px] text-[#9a938a] leading-relaxed">
                Maintain audit log logs and member invites securely with dynamic workspace token validation middleware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 sm:px-8 max-w-7xl mx-auto relative z-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#d4af37]">Built for Engineers</h2>
          <p className="text-2xl font-serif text-[#f3dfa0]">Advanced modules right out of the box</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_HIGHLIGHTS.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-5 border border-white/5 bg-black/40 backdrop-blur rounded-2xl flex flex-col gap-3 shadow-sm hover:border-[#d4af37]/30 transition-colors"
              >
                <span className="h-8 w-8 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/15">
                  <IconComp className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-xs font-bold text-foreground">{feat.title}</h3>
                <p className="text-[10px] text-[#9a938a] leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 sm:px-8 border-y border-white/5 bg-[#0d0b10] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#d4af37]">Testimonials</h2>
            <p className="text-2xl font-serif text-[#f3dfa0]">Validated by Agile developers worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((test, idx) => (
              <Card key={idx} className="p-6 flex flex-col gap-4 justify-between border-white/5 bg-black/40 backdrop-blur">
                <div className="flex gap-1">
                  {Array.from({ length: test.rating }).map((_, rIdx) => (
                    <Star key={rIdx} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-[#9a938a] italic leading-relaxed">
                  "{test.quote}"
                </p>
                <div className="flex flex-col gap-0.5 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-black text-foreground">{test.author}</span>
                  <span className="text-[9px] text-[#9a938a]">{test.role}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-6 sm:px-8 max-w-3xl mx-auto relative z-20">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#d4af37]">FAQ</h2>
          <p className="text-2xl font-serif text-[#f3dfa0]">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-white/5 bg-black/40 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-foreground hover:bg-white/5 focus-visible:outline-none"
              >
                <span>{faq.question}</span>
                <Plus 
                  className={`h-4 w-4 text-[#d4af37] transition-transform duration-300 ${
                    activeFaq === idx ? "rotate-45" : ""
                  }`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-[11px] text-[#9a938a] leading-relaxed border-t border-white/5 bg-black/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Panel Section */}
      <section className="cta py-24 px-6 text-center relative z-20" id="cta">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cta-panel max-w-2xl mx-auto p-12 rounded-3xl glass-panel relative overflow-hidden"
        >
          {/* Inner ambient glow background */}
          <div className="absolute inset-0 bg-radial from-[#d4af37]/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-8 flex flex-col items-center">
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
    </div>
  );
};
