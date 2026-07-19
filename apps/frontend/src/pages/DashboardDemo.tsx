import React from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { ShieldCheck, User as UserIcon, LogOut, CheckCircle2 } from "lucide-react";

export const DashboardDemo: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <span className="font-bold text-lg bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Protected Workspace
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <UserIcon className="w-4 h-4 text-purple-400" />
            <span>{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Authentication Verified</h1>
              <p className="text-slate-400 text-sm">
                You are securely logged into the protected SaaS area.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 text-xs uppercase font-semibold">User ID</span>
              <p className="font-mono text-slate-200 mt-1 break-all">{user?.id}</p>
            </div>
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 text-xs uppercase font-semibold">Email Address</span>
              <p className="font-medium text-slate-200 mt-1">{user?.email}</p>
            </div>
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 text-xs uppercase font-semibold">Full Name</span>
              <p className="font-medium text-slate-200 mt-1">{user?.full_name || "Not provided"}</p>
            </div>
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 text-xs uppercase font-semibold">Role</span>
              <p className="font-medium text-purple-400 mt-1 uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
