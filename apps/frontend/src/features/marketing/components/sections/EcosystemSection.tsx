import React from "react";

export const EcosystemSection: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-[1100px] mx-auto my-28 px-6 relative z-10 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Feature 1 */}
        <div className="group bg-[#131316] border border-[#26262b] hover:border-[#3a3a3f] rounded-2xl p-7 relative overflow-hidden h-[230px] transition-all duration-250 hover:-translate-y-1">
          <h3 className="font-sans font-semibold text-base text-[#f3f1ec] mb-2">
            Boards that move
          </h3>
          <p className="text-xs text-[#8b8a90] leading-relaxed max-w-[220px]">
            Drag a card and the whole team feels it — live, no refresh.
          </p>
          <div className="absolute right-[-10px] bottom-[-10px] w-[150px] h-[110px] opacity-85 group-hover:-translate-y-1.5 transition-transform duration-400">
            <div className="h-2 rounded bg-[#26262b] mb-1.5 w-[70%]" />
            <div className="flex gap-1.5 mb-1.5">
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b] group-hover:bg-[#ff4d2e]/14 group-hover:border-[#ff4d2e] transition-colors" />
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b]" />
            </div>
            <div className="h-1 bg-[#26262b] rounded w-[60%] mb-1" />
            <div className="h-1 bg-[#26262b] rounded w-[40%]" />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="group bg-[#131316] border border-[#26262b] hover:border-[#3a3a3f] rounded-2xl p-7 relative overflow-hidden h-[230px] transition-all duration-250 hover:-translate-y-1">
          <h3 className="font-sans font-semibold text-base text-[#f3f1ec] mb-2">
            Sprints, planned in minutes
          </h3>
          <p className="text-xs text-[#8b8a90] leading-relaxed max-w-[220px]">
            Auto-balanced sprint loads based on your team's real velocity.
          </p>
          <div className="absolute right-[-10px] bottom-[-10px] w-[150px] h-[110px] opacity-85 group-hover:-translate-y-1.5 transition-transform duration-400">
            <div className="h-2 rounded bg-[#26262b] mb-1.5 w-[50%]" />
            <div className="flex gap-1.5 mb-1.5">
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b] group-hover:bg-[#ff4d2e]/14 group-hover:border-[#ff4d2e] transition-colors" />
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b]" />
            </div>
            <div className="h-1 bg-[#26262b] rounded w-[60%] mb-1" />
            <div className="h-1 bg-[#26262b] rounded w-[40%]" />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="group bg-[#131316] border border-[#26262b] hover:border-[#3a3a3f] rounded-2xl p-7 relative overflow-hidden h-[230px] transition-all duration-250 hover:-translate-y-1">
          <h3 className="font-sans font-semibold text-base text-[#f3f1ec] mb-2">
            AI that reads the room
          </h3>
          <p className="text-xs text-[#8b8a90] leading-relaxed max-w-[220px]">
            Standup summaries, blocker detection, and status updates — written for you.
          </p>
          <div className="absolute right-[-10px] bottom-[-10px] w-[150px] h-[110px] opacity-85 group-hover:-translate-y-1.5 transition-transform duration-400">
            <div className="h-2 rounded bg-[#26262b] mb-1.5 w-[85%]" />
            <div className="flex gap-1.5 mb-1.5">
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b] group-hover:bg-[#ff4d2e]/14 group-hover:border-[#ff4d2e] transition-colors" />
              <div className="h-6 flex-1 rounded bg-[#1b1b1f] border border-[#26262b]" />
            </div>
            <div className="h-1 bg-[#26262b] rounded w-[60%] mb-1" />
            <div className="h-1 bg-[#26262b] rounded w-[40%]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
