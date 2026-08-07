import React, { memo } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { MagneticButton } from "../ui/MagneticButton";

export const PricingSequence: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-10">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Investment
          </span>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Plans built to scale with your team.
          </h2>
          <p className="text-[#9a938a] text-sm max-w-md mx-auto leading-relaxed">
            Start free, invite your team, and unlock intelligence parameters as you grow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free plan */}
          <GlassPanel className="p-6 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[#9a938a] uppercase tracking-widest">Base</span>
              <p className="text-2xl font-serif text-white">Free Plan</p>
              <p className="text-3xl font-black text-white">$0</p>
              <ul className="space-y-2 text-[11px] text-[#9a938a]">
                <li>• Up to 5 members</li>
                <li>• Standard Kanban board</li>
                <li>• Local SQLite caching</li>
              </ul>
            </div>
            <MagneticButton
              to="/register"
              className="mt-6 w-full py-2.5 text-[11px] font-bold tracking-wide rounded-full text-white border border-white/20 hover:border-white/50"
            >
              Get Started Free
            </MagneticButton>
          </GlassPanel>

          {/* Pro plan */}
          <GlassPanel className="p-6 flex flex-col justify-between min-h-[300px] border-[#d4af37]/35 shadow-[0_0_20px_rgba(212,175,55,0.06)]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">Pro</span>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  Recommended
                </span>
              </div>
              <p className="text-2xl font-serif text-white">Scale Plan</p>
              <p className="text-3xl font-black text-[#d4af37]">$12 <span className="text-xs text-[#9a938a] font-normal">/ user / mo</span></p>
              <ul className="space-y-2 text-[11px] text-[#ffe9a0]/90">
                <li>• Unlimited projects & members</li>
                <li>• AI copilot sprint planner</li>
                <li>• WebSocket presence cursors</li>
                <li>• Supabase Cloud Sync</li>
              </ul>
            </div>
            <MagneticButton
              to="/register"
              className="mt-6 w-full py-2.5 text-[11px] font-bold tracking-wide rounded-full text-[#1a1206]"
              style={{
                background: "linear-gradient(135deg, #ffe9a0, #d4af37 60%, #8a6b1f)",
              }}
            >
              Unlock Scale →
            </MagneticButton>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
});

PricingSequence.displayName = "PricingSequence";
export default PricingSequence;
