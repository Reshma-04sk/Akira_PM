import React, { useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
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
import { Button } from "@/components/ui/button";
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
    answer: "Absolutely. We supply modular Dockerfiles and production compose files (`docker-compose.production.yml`) allowing you to orchestrate resources on AWS, Google Cloud, or bare metal.",
  },
  {
    question: "How do the Reports and Calendar modules work?",
    answer: "Reports fetch and compile workspace status/workloads client-side with native SVG visual graphs and print-friendly CSS. The Calendar features HTML5 drag listeners to update sprint targets instantly.",
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
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-background/30">
      {/* 3D background */}
      <Suspense fallback={<div className="absolute inset-0 -z-10 bg-background" />}>
        <InteractiveBackground />
      </Suspense>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm animate-pulse">
              Production-Grade v1.0 Launch
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
              Collaborative Project Management{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Engineered for Performance
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Akira-PM aggregates team boards, monthly calendar schedulers, custom SVG performance metrics, and enterprise security in a unified workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3"
          >
            <Link to="/register">
              <Button size="lg" className="h-10 px-5 gap-1.5 font-bold shadow-md hover:scale-[1.01] transition-transform">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="h-10 px-5 font-bold hover:bg-accent/40">
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Interactive Hero Visual Mockup with Floating UI widgets */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-5xl mx-auto border border-border/80 bg-card rounded-2xl overflow-hidden shadow-2xl mt-12 bg-card/60 backdrop-blur-md"
          >
            <div className="bg-muted/40 px-4 py-2 border-b border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-semibold font-mono text-[10px] tracking-wide">akira-pm-shell (v1.0.0)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wide">Connected</span>
            </div>
            
            <div className="p-4 sm:p-6 bg-background/40">
              <img
                src="/assets/preview_dashboard.webp"
                alt="Akira Board Preview"
                width={1000}
                height={500}
                className="w-full object-cover rounded-lg shadow-md border border-border/30 max-h-[480px]"
              />

              {/* Floating UI Widget 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-4 hidden lg:flex items-center gap-3 p-3 border border-border bg-card/90 backdrop-blur rounded-xl shadow-lg w-52 text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground">Sprint Velocity</p>
                  <p className="text-[9px] text-muted-foreground">42 completed tasks this cycle</p>
                </div>
              </motion.div>

              {/* Floating UI Widget 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 -right-4 hidden lg:flex items-center gap-3 p-3 border border-border bg-card/90 backdrop-blur rounded-xl shadow-lg w-56 text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground">Security Shield</p>
                  <p className="text-[9px] text-muted-foreground">Active CSP & JWT rotators</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-border/40 bg-card/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trusted by engineering teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-6 grayscale opacity-60">
            <span className="text-sm font-black tracking-tight hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-foreground">VELOCE TECH</span>
            <span className="text-sm font-black tracking-tight hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-foreground">GRIDSCALE</span>
            <span className="text-sm font-black tracking-tight hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-foreground">SECUREFLOW</span>
            <span className="text-sm font-black tracking-tight hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-foreground">DEVCORE</span>
          </div>
        </div>
      </section>

      {/* Why Akira-PM Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Why Akira-PM</h2>
          <p className="text-2xl sm:text-3xl font-black text-foreground">Designed for high-velocity teams</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Akira-PM provides complete, production-ready workspace architectures with absolute data transparency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -5 }} 
            className="p-6 border border-border bg-card/45 backdrop-blur rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Extreme Responsiveness</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              With integrated Upstash Redis caching, response aggregation, and 30-second stale time client-side, metrics load instantly.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }} 
            className="p-6 border border-border bg-card/45 backdrop-blur rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Complete Data Privacy</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Host your workspace database locally or on private clouds. We support fully isolated configurations using Docker compose tools.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }} 
            className="p-6 border border-border bg-card/45 backdrop-blur rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Advanced Security Headers</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Equipped with strict Content-Security-Policies, Referrer-Policy blockers, and token validation checks built directly into routes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Productivity Statistics Widget Section */}
      <section className="py-16 bg-card/20 border-y border-border/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Performance Metrics
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Keep sprints running on schedule</h2>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Track cycle completion ratios, workload allocations, and overdue limits in real-time. Our custom client-side SVG metrics print directly to PDF for team reports.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-1.5">
                <span className="text-3xl font-black text-primary">-45%</span>
                <p className="text-[10px] text-muted-foreground font-bold">Reduction in cycle times</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-3xl font-black text-primary">99.9%</span>
                <p className="text-[10px] text-muted-foreground font-bold">Workspace uptime guarantee</p>
              </div>
            </div>
          </div>

          {/* Interactive Stats Dashboard Mockup */}
          <div className="p-5 border border-border bg-card rounded-2xl shadow-xl space-y-4 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Workspace Metrics</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">July 2026 Cycle</span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">Completed Tasks</span>
                  <span className="text-foreground">78%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "78%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">Sprint Hit Rate</span>
                  <span className="text-foreground">92%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "92%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">Resource Utilization</span>
                  <span className="text-foreground">64%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "64%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-yellow-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Built for Engineers</h2>
            <p className="text-2xl font-black text-foreground">Advanced modules right out of the box</p>
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
                  className="p-5 border border-border bg-card/65 backdrop-blur rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow hover:bg-card transition-all"
                >
                  <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/15">
                    <IconComp className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-xs font-bold text-foreground">{feat.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-card/25 border-y border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Testimonials</h2>
            <p className="text-2xl font-black text-foreground">Validated by Agile developers worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((test, idx) => (
              <Card key={idx} className="p-5 flex flex-col gap-4 justify-between border-border bg-card/45 backdrop-blur">
                <div className="flex gap-1">
                  {Array.from({ length: test.rating }).map((_, rIdx) => (
                    <Star key={rIdx} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  "{test.quote}"
                </p>
                <div className="flex flex-col gap-0.5 pt-3 border-t border-border/20">
                  <span className="text-[10px] font-black text-foreground">{test.author}</span>
                  <span className="text-[9px] text-muted-foreground">{test.role}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Support & FAQ</h2>
            <p className="text-2xl font-black text-foreground">Got questions? We've got answers</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-border bg-card/40 backdrop-blur rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-foreground hover:bg-accent/10 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="p-0.5 rounded border border-border bg-background ml-4 shrink-0 transition-transform duration-200">
                      <Plus className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-card/25"
                      >
                        <p className="p-4 pt-0 text-[10px] text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Signup CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-primary/5 text-center relative border-t border-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
            Ready to upgrade your project planning?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
            Join thousands of developers resolving sprints, tracking workloads, and analyzing stats in modern real-time layouts.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="h-10 px-6 font-bold shadow-md hover:scale-[1.01] transition-transform">
                Sign Up for Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="h-10 px-6 font-bold hover:bg-accent/40">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
