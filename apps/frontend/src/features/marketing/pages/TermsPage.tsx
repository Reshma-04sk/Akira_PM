import React from "react";
import { motion } from "framer-motion";
import { Scale, RefreshCw, Cpu, HelpCircle } from "lucide-react";

export const TermsPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Legal Blueprint
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Last updated: July 30, 2026. Review rules, usage boundaries, and service liabilities for the Akira-PM workspaces.
        </p>
      </div>

      <div className="max-w-4xl mx-auto border border-border bg-card/45 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <Scale className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">1. Account Terms and Usage</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                You must supply accurate email information to activate workspaces. You are solely responsible for maintaining the confidentiality of access tokens and passwords. You agree not to distribute malicious software or bypass platform access layers.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">2. Refresh Token Rotation & Access</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Akira-PM provides cryptographically secure token rotators and active session logs. Any session terminated via logout invalidates refresh tokens immediately in real-time. Unauthorized attempts to reuse expired tokens may lock your workspace account.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <Cpu className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">3. Infrastructure Limits & SLAs</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Free Developer plan workspaces are hosted on shared resources. We enforce a 10MB file size limit per attachment upload. Upgrading to an Enterprise subscription deploys dedicated database instances with custom SLA connection guarantees.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">4. Liability & Warranty</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Akira-PM software is supplied "as is". While we implement security headers and active database backups, we do not take responsibility for losses arising from self-hosted cluster deployment misconfigurations.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-border/40 pt-8 text-[10px] text-muted-foreground leading-relaxed">
          For technical licensing inquiries or customized corporate service Level Agreements, please contact our support staff at <span className="font-extrabold text-foreground">support@akirapm.io</span>.
        </div>
      </div>
    </div>
  );
};
export default TermsPage;
