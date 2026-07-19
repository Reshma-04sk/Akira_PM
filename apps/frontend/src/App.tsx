import React from "react";
import { 
  Layers, 
  Database, 
  Terminal, 
  Activity, 
  Cpu, 
  Navigation,
  Globe
} from "lucide-react";

export default function App() {
  const stack = [
    { name: "React 19", icon: Cpu, color: "text-blue-400" },
    { name: "TypeScript", icon: Terminal, color: "text-blue-500" },
    { name: "Vite 6", icon: Activity, color: "text-yellow-400" },
    { name: "Tailwind CSS", icon: Layers, color: "text-cyan-400" },
    { name: "React Router", icon: Navigation, color: "text-purple-400" },
    { name: "TanStack Query", icon: Database, color: "text-red-400" },
    { name: "Axios", icon: Globe, color: "text-indigo-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-[96px] pointer-events-none" />

      {/* Main Container */}
      <main className="z-10 w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl shadow-purple-950/20 text-center">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-6 animate-pulse">
          <Layers className="w-12 h-12 text-purple-400" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent mb-4">
          SaaS Project Foundation
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
          The frontend foundation is successfully initialized. Everything is prepared to start building.
        </p>

        {/* Stack Badges */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Configured Technologies
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm hover:border-slate-700 transition duration-200"
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Frontend Active
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 mt-8 text-xs text-slate-600">
        Workspace initialized • Ready for feature expansion
      </footer>
    </div>
  );
}
