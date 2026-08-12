import React from "react";

export const AnalyticsSection: React.FC = () => {
  return (
    <section id="analytics" className="w-full relative z-10 py-24 border-t border-[#26262b]/60 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            Act IV · Momentum
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Progress should explain itself.
          </h2>
          <p className="text-[#8b8a90] text-sm md:text-base leading-relaxed font-sans">
            Auto-calculated sprint velocity, cycle times, and bottleneck detection.
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metric Cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#131316] border border-[#26262b] rounded-xl p-6">
              <div className="font-mono text-xs text-[#8b8a90] mb-2 uppercase">VELOCITY</div>
              <div className="font-serif text-4xl text-[#ff4d2e] mb-1">42 pts</div>
              <div className="text-xs text-[#8b8a90]">+14% vs previous sprint</div>
            </div>

            <div className="bg-[#131316] border border-[#26262b] rounded-xl p-6">
              <div className="font-mono text-xs text-[#8b8a90] mb-2 uppercase">AVG CYCLE TIME</div>
              <div className="font-serif text-4xl text-[#f3f1ec] mb-1">3.8 days</div>
              <div className="text-xs text-[#8b8a90]">-0.6d faster resolution</div>
            </div>

            <div className="bg-[#131316] border border-[#26262b] rounded-xl p-6 flex justify-between">
              <div>
                <div className="font-mono text-xs text-[#8b8a90] mb-1">COMPLETED</div>
                <div className="font-serif text-2xl text-[#f3f1ec]">27 tasks</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-[#8b8a90] mb-1">BLOCKED</div>
                <div className="font-serif text-2xl text-[#ff4d2e]">2 tasks</div>
              </div>
            </div>
          </div>

          {/* SVG Line Chart View */}
          <div className="lg:col-span-2 bg-[#131316] border border-[#26262b] rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="font-mono text-xs text-[#f3f1ec] tracking-wider uppercase">
                SPRINT VELOCITY TREND
              </div>
              <div className="flex gap-4 font-mono text-xs text-[#8b8a90]">
                <span>Sprint 12</span>
                <span>Sprint 13</span>
                <span className="text-[#ff4d2e]">Sprint 14</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full h-48 my-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#26262b" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#26262b" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#26262b" strokeDasharray="4 4" />

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="#ff4d2e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,120 160,85 300,95 480,25"
                />

                {/* Event Markers */}
                <circle cx="160" cy="85" r="5" fill="#131316" stroke="#ff4d2e" strokeWidth="2" />
                <circle cx="300" cy="95" r="5" fill="#131316" stroke="#ff4d2e" strokeWidth="2" />
                <circle cx="480" cy="25" r="6" fill="#ff4d2e" />
              </svg>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-[#8b8a90] pt-4 border-t border-[#26262b]">
              <span>PREDICTIVE ACCURACY: 96%</span>
              <span className="text-[#ff4d2e]">ON TRACK FOR RELEASE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
