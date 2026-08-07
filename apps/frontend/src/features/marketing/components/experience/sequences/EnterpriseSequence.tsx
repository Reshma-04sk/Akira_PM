import React, { memo } from "react";
import { GlassPanel } from "../ui/GlassPanel";

export const EnterpriseSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#3b82f6]">
            Trust
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Security and network insulation.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Vault parameters keep your project indices secure with enterprise grade isolation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <GlassPanel className="p-5 space-y-3">
            <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">Single Sign-On</span>
            <p className="text-sm font-semibold text-white">SAML & OIDC</p>
            <p className="text-[11px] text-[#9a938a] leading-relaxed">
              Authenticate using Okta, Azure AD, or Google Workspace configurations.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-3">
            <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Data Encryption</span>
            <p className="text-sm font-semibold text-white">AES-256 & TLS 1.3</p>
            <p className="text-[11px] text-[#9a938a] leading-relaxed">
              Every data node is fully encrypted in transit and at rest in Supabase vaults.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
});

EnterpriseSequence.displayName = "EnterpriseSequence";
export default EnterpriseSequence;
