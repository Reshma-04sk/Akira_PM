import React from "react";
import AkiraLogo from "../ui/AkiraLogo";

export const Sidebar: React.FC = () => {
  const workspaceItems = [
    { label: "Overview", icon: "▢" },
    { label: "Projects", icon: "▤", active: true },
    { label: "Tasks", icon: "▥" },
    { label: "Analytics", icon: "▰" },
    { label: "Team", icon: "▵" },
  ];

  const projectItems = [
    { label: "Core Engine", color: "bg-[#7c8cff]/70" },
    { label: "Platform UI", color: "bg-[#55d6ff]/70" },
    { label: "Infrastructure", color: "bg-emerald-500/70" },
  ];

  const personalItems = [
    { label: "My Tasks", icon: "✓" },
    { label: "Saved Views", icon: "☆" },
  ];

  return (
    <div 
      style={{ transform: "translate3d(calc(var(--mouse-x) * 2px), calc(var(--mouse-y) * -1.5px), 0)" }}
      className="hidden md:flex w-52 border-r border-white/8 bg-[#0D1016] p-4 flex-col gap-5 select-none shrink-0 h-full text-left transition-transform duration-75"
    >
      {/* 1. Header identity */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <AkiraLogo className="h-4.5 w-auto text-[#7c8cff]" />
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold tracking-wider text-[#E8EDF5] uppercase">
            AKIRA
          </span>
          <span className="text-[8px] text-gray-500 font-mono">Core Engineering</span>
        </div>
      </div>

      {/* 2. Workspace Menu list */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest px-1">
          Workspace
        </span>
        <nav className="flex flex-col gap-0.5">
          {workspaceItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer
                         ${item.active 
                           ? "bg-[#7c8cff]/10 text-[#7c8cff]" 
                           : "text-[#8b95a5] hover:text-[#E8EDF5] hover:bg-white/5"
                         }`}
            >
              <span className="text-xs font-mono opacity-80 leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.active && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#7c8cff] ml-auto" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* 3. Projects list */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest px-1">
          Projects
        </span>
        <nav className="flex flex-col gap-0.5">
          {projectItems.map((proj, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#8b95a5] hover:text-[#E8EDF5] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${proj.color}`} />
              <span>{proj.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* 4. Personal links list */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest px-1">
          Personal
        </span>
        <nav className="flex flex-col gap-0.5">
          {personalItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#8b95a5] hover:text-[#E8EDF5] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="text-xs font-mono opacity-80 leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Settings Section */}
      <div className="mt-auto flex flex-col gap-2">
        <div className="h-px bg-white/5" />
        
        {/* Settings Button */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#8b95a5] hover:text-[#E8EDF5] hover:bg-white/5 transition-colors cursor-pointer">
          <span className="text-xs font-mono opacity-80 leading-none">⚙</span>
          <span>Settings</span>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 px-1.5 pt-1">
          <div className="w-6.5 h-6.5 rounded-full bg-[#7c8cff]/20 border border-[#7c8cff]/30 flex items-center justify-center text-[9px] font-bold text-[#7c8cff] font-mono">
            AL
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-semibold text-gray-300 leading-none">Alex R.</span>
            <span className="text-[8px] text-gray-500 font-mono mt-0.5">Maintainer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
