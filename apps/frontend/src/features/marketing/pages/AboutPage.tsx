import React from "react";
import { motion } from "framer-motion";
import { Users, Eye, Target, Award } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Agility & Speed",
    desc: "Fast deployments, connection pool caching, and visual kanban drag actions keep project cycles running at maximum speed.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    desc: "We prioritize open logging, structured error tracing formats, and accessible reports dashboards so dev teams are always aligned.",
  },
  {
    icon: Users,
    title: "Developer First",
    desc: "Supply modular docker containers, automated alembic database updates, and clear setting schemas to ensure a frictionless config experience.",
  },
  {
    icon: Award,
    title: "Production Grade",
    desc: "We enforce strict unit test coverage, CORS controls, TrustedHost security filters, and JSON logging to protect database privacy.",
  },
];

const TIMELINE = [
  {
    date: "Q1 2026",
    title: "Foundation Blueprint",
    desc: "Launched the initial project schema. Integrated FastAPI with SQLite testing databases and initialized base setting validation layers.",
  },
  {
    date: "Q2 2026",
    title: "Real-Time Workflows",
    desc: "Implemented workspaces databases, Kanban workflow status columns, audit logging, and team member invitations.",
  },
  {
    date: "Q3 2026",
    title: "Analytics & Calendar Expansion",
    desc: "Shipped the complete Reports & Calendar modules. Integrated monthly drag deadline updates, comment threads, SVG priority charts, and CSV/PDF downloads.",
  },
  {
    date: "Q4 2026",
    title: "Production-Grade Infrastructure",
    desc: "Upgraded Dockerfiles to Nginx SPA routing. Standardized structured logging format, bound TrustedHost security middlewares, and automated CI pipelines.",
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Core Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          A platform built for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            collaborative performance
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Akira-PM was designed to bridge the gap between lightweight task trackers and heavy, complex enterprise tools. We provide clean, fast workspace management.
        </p>
      </div>

      {/* Values Grid */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {VALUES.map((val, idx) => {
          const IconComp = val.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-5 border border-border bg-card/45 backdrop-blur rounded-2xl flex flex-col gap-3.5 shadow-sm hover:shadow hover:bg-card transition-all"
            >
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/15">
                <IconComp className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-xs font-bold text-foreground">{val.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {val.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Timeline Section */}
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Platform Journey</h2>
          <p className="text-xl font-black text-foreground">Akira-PM Development Timeline</p>
        </div>

        <div className="relative pl-6 border-l border-border/80 space-y-12 py-2">
          {TIMELINE.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative text-xs leading-relaxed"
            >
              {/* Timeline Dot */}
              <span className="absolute -left-[32px] top-4.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background shadow-md ring-4 ring-primary/10" />
              
              <div className="space-y-1 bg-card/40 border border-border/60 p-5 rounded-2xl backdrop-blur-sm shadow-sm hover:bg-card/70 hover:border-primary/30 transition-all">
                <span className="text-[9px] font-black text-primary uppercase tracking-wider">{item.date}</span>
                <h4 className="text-xs font-bold text-foreground mt-0.5">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
