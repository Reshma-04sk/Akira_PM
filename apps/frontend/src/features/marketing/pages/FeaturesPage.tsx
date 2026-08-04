import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Terminal, 
  Activity, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Cpu, 
  Zap, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DETAILS_LIST = [
  {
    icon: Terminal,
    title: "Production Workspace Shell",
    details: "Configure workspaces, create sub-projects, and control access permissions. We enforce strict PostgreSQL migrations alongside structured database schemas.",
  },
  {
    icon: Shield,
    title: "FastAPI Guard & Security",
    details: "Equipped with CORS validations, TrustedHost filters, and production environment encryption configurations. Complete cookie handling and password encryption.",
  },
  {
    icon: Activity,
    title: "Interactive Kanban Workflow",
    details: "Organize tasks via interactive boards, drag tasks between status checkpoints, assign workloads, and trigger real-time notification alerts.",
  },
  {
    icon: CalendarIcon,
    title: "Sprint Schedule Drag & Drop",
    details: "Plan workflows on monthly grids. Reschedule due dates directly via HTML5 drop triggers. Click target days to display detailed overlays with attachment threads.",
  },
  {
    icon: BarChart3,
    title: "Custom SVG Metrics & PDF",
    details: "Render custom status bars and priority donut SVG circles client-side. Output documents using CSS page styles or export detailed CSV databases.",
  },
  {
    icon: Cpu,
    title: "Upstash Caching & Pooling",
    details: "Accelerated database responses using connection pools and Upstash Redis caches. Guaranteed low-latency request resolutions even under spikes.",
  },
];

export const FeaturesPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Platform Blueprint
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          A feature set crafted for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            modern dev teams
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Akira-PM integrates core task tracking structures with performance metrics. Here is an overview of the platform layers.
        </p>
      </div>

      {/* Details Grid */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {DETAILS_LIST.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-6 border border-border bg-card/45 backdrop-blur rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow hover:bg-card transition-all"
            >
              <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <IconComp className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground">{item.title}</h3>
                <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                  {item.details}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Showcase Visual Callout */}
      <div className="max-w-5xl mx-auto border border-border/80 bg-card/45 backdrop-blur rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center gap-8 bg-card/60">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Optimized build compilation</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Our build setup supports modular code-splitting and dynamic chunk loading. Combined with structured production logging, this provides reliable deployments.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/20">
              <Zap className="h-3.5 w-3.5 text-primary" /> React 19 Core
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/20">
              <Cpu className="h-3.5 w-3.5 text-primary" /> Vite Bundle Optimization
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/20">
              <Globe className="h-3.5 w-3.5 text-primary" /> Tailwind CSS
            </span>
          </div>
          <Link to="/register" className="inline-block pt-2">
            <Button size="sm" className="h-9 gap-1.5 font-bold shadow-sm">
              Deploy Workspace Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Small animated decorative component */}
        <div className="flex-1 w-full max-w-[320px] border border-border/60 bg-muted/20 rounded-2xl p-4 space-y-3 shadow-inner select-none no-print bg-black/10 dark:bg-black/30 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold border-b border-border/40 pb-2">
            <span>Server Response Logs</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-2 text-[9.5px] font-mono text-muted-foreground leading-relaxed">
            <div className="flex justify-between border-b border-border/25 pb-1.5">
              <span className="text-emerald-500 font-bold">GET /api/v1/health</span>
              <span className="font-extrabold text-foreground">200 OK (1.2ms)</span>
            </div>
            <div className="flex justify-between border-b border-border/25 pb-1.5">
              <span className="text-emerald-500 font-bold">GET /api/v1/dashboard</span>
              <span className="font-extrabold text-foreground">200 OK (15ms)</span>
            </div>
            <div className="flex justify-between border-b border-border/25 pb-1.5">
              <span className="text-purple-500 font-bold">PATCH /tasks/5a3e9c</span>
              <span className="font-extrabold text-foreground">204 NO_CONTENT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-500 font-bold">POST /attachments</span>
              <span className="font-extrabold text-foreground">201 CREATED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon import helper
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default FeaturesPage;
