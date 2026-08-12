import React from "react";

export const RealtimeCollabSection: React.FC = () => {
  const events = [
    { time: "12:42", text: "MN moved AK-121 to Review", type: "MOVE" },
    { time: "12:43", text: "RS added a review note on PR #412", type: "NOTE" },
    { time: "12:45", text: "AK-121 approved and merged to main", type: "SHIPPED" },
  ];

  return (
    <section className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            09 · Real-time Collaboration
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Built for multi-player engineering.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Realtime cursors, live state updates, and synchronized activity feeds across every member.
          </p>
        </div>

        {/* Shared Workspace Container */}
        <div className="max-w-3xl mx-auto bg-[#131316] border border-[#26262b] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Cursors Overlay */}
          <div className="absolute top-[25%] left-[20%] flex items-center gap-1.5 bg-[#ff4d2e] text-[#1a0a06] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg">
            RS · Reviewing
          </div>
          <div className="absolute top-[55%] right-[25%] flex items-center gap-1.5 bg-white text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg">
            MN · Editing
          </div>

          <div className="font-mono text-xs text-[#8b8a90] mb-6 pb-4 border-b border-[#26262b] flex items-center justify-between">
            <span>LIVE ACTIVITY STREAM</span>
            <span className="text-[#ff4d2e]">3 COLLABORATORS ONLINE</span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {events.map((evt, i) => (
              <div
                key={i}
                className="bg-[#1b1b1f] border border-[#26262b] rounded-lg p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#8b8a90]">{evt.time}</span>
                  <span className="text-[#f3f1ec]">{evt.text}</span>
                </div>
                <span className="text-[10px] bg-[#ff4d2e]/14 text-[#ff4d2e] px-2 py-0.5 rounded">
                  {evt.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealtimeCollabSection;
