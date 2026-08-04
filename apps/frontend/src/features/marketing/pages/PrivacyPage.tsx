import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Legal Blueprint
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Last updated: July 30, 2026. Review how Akira-PM collects, handles, and protects your personal credentials and metrics.
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
              <Shield className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">1. Data Storage Boundaries</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Akira-PM provides self-hosted containers alongside cloud-coordinated deployments. If self-hosting, all task descriptions, member databases, and comments reside purely inside your local cluster infrastructure. Our cloud caching proxies only hold connection caches to speed up authentication handshakes and dashboard loading times.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <Eye className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">2. Information Collection</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                To activate workspace collaboration, we register standard account criteria: name, corporate email address, and encrypted passwords. If you upload attachments, metadata (file size, filename, mime-type) is recorded inside databases to secure access paths. We never parse or scan your attachment contents.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <Lock className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">3. Security Practices</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                We implement production-ready controls, including strict API security headers, CORS allowed origins restrictions, and cross-origin resource blocking. Refresh tokens are stored strictly as SHA-256 hashes, and JWT signatures utilize secure server-side secrets. All transit data runs over secure TLS (HTTPS).
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-1">
              <FileText className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground">4. Cookies and Session Lifecycles</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                We use strictly functional, essential session cookies and local storage tokens to preserve your login states. We do not use advertising tracking cookies or share visitor data with third-party tracking conglomerates.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-border/40 pt-8 text-[10px] text-muted-foreground leading-relaxed">
          If you have questions regarding our data privacy schemas or want to request account removal, please email our legal coordinators at <span className="font-extrabold text-foreground">privacy@akirapm.io</span>.
        </div>
      </div>
    </div>
  );
};
export default PrivacyPage;
