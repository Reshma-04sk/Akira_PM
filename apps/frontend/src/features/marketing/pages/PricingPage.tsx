import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/data-display";

const TIERS = [
  {
    name: "Developer Starter",
    priceMonthly: 0,
    priceYearly: 0,
    desc: "Perfect for single developers auditing and scheduling personal workflows.",
    features: [
      "Up to 2 active Workspaces",
      "1 Project workspace per Workspace",
      "Standard interactive Kanban Board",
      "Monthly Calendar Sprint planner",
      "Basic dashboard performance stats",
      "Standard SQLite database backend",
    ],
    cta: "Start Free",
    path: "/register",
    featured: false,
  },
  {
    name: "Agile Pro Team",
    priceMonthly: 12,
    priceYearly: 9,
    desc: "For growing teams that need extensive workload metrics and integrations.",
    features: [
      "Unlimited active Workspaces",
      "Unlimited Projects per Workspace",
      "Drag-and-Drop date rescheduling",
      "Custom status/priority SVG reports",
      "Team workload distribution charts",
      "CSV & PDF dashboard exports",
      "Upstash Redis caching integration",
    ],
    cta: "Start Pro Trial",
    path: "/register",
    featured: true,
  },
  {
    name: "Enterprise Dedicated",
    priceMonthly: 49,
    priceYearly: 39,
    desc: "Custom deployments with dedicated support, RBAC structures, and SLAs.",
    features: [
      "All Pro Features included",
      "Enterprise security headers configuration",
      "Dedicated PostgreSQL connection pools",
      "JSON formatted production logs",
      "Custom domain & SSL setups",
      "24/7 dedicated support SLA engineers",
    ],
    cta: "Contact Enterprise",
    path: "/contact",
    featured: false,
  },
];

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Pricing Blueprint
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Flexible plans scaled for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            every scale
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          No hidden locks. Choose a tier that matches your team scale. Save up to 25% with annual subscription setups.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <span className={`text-[11px] font-bold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className="h-6 w-11 rounded-full bg-muted border border-border/80 flex items-center p-0.5 transition-colors relative cursor-pointer"
        >
          <span
            className={`h-4.5 w-4.5 rounded-full bg-primary transition-all duration-200 ${
              billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className={`text-[11px] font-bold ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"} flex items-center gap-1.5`}>
          Yearly Billing
          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
            Save 25%
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-20 items-stretch">
        {TIERS.map((tier, idx) => {
          const price = billingCycle === "yearly" ? tier.priceYearly : tier.priceMonthly;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex"
            >
              <Card
                className={`p-6 sm:p-8 flex flex-col justify-between flex-1 border shadow-sm relative transition-all duration-300 ${
                  tier.featured
                    ? "border-primary bg-card/60 backdrop-blur-md ring-2 ring-primary/10 shadow-primary/5"
                    : "border-border bg-card/45 backdrop-blur-sm shadow-sm"
                } hover:bg-card`}
              >
                {tier.featured && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-foreground capitalize">{tier.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      ${price}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      / user / month
                    </span>
                  </div>

                  <div className="border-t border-border/30 pt-6 space-y-3">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-[10px]">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-normal font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link to={tier.path}>
                    <Button
                      variant={tier.featured ? "primary" : "outline"}
                      className="w-full h-10 font-bold shadow-sm"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Callout */}
      <div className="max-w-3xl mx-auto border border-border bg-card/30 backdrop-blur-sm rounded-2xl p-6 flex gap-4 text-[11px] leading-relaxed text-muted-foreground bg-card/50 shadow-sm">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p>
          Need dedicated databases on private VPCs or specific regional hosts for regulatory compliance? Contact our support staff on our Enterprise plan, and we will customize a secure infrastructure solution matching your security targets.
        </p>
      </div>
    </div>
  );
};
export default PricingPage;
