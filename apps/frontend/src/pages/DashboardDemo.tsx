import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  Activity, 
  Key, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Calendar,
  AlertCircle
} from "lucide-react";

export const DashboardDemo: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
  const [page, setPage] = useState<number>(1);
  const size = 6;

  // Retrieve audit logs using react-query
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["auditLogs", page],
    queryFn: () => authService.getAuditLogs(page, size),
    enabled: activeTab === "activity",
  });

  // State to track expanded detail IDs
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  const toggleExpandLog = (id: string) => {
    const newSet = new Set(expandedLogIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedLogIds(newSet);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "user_register":
        return {
          label: "Registration",
          icon: <UserIcon className="w-3.5 h-3.5" />,
          classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        };
      case "user_login":
        return {
          label: "Login",
          icon: <Key className="w-3.5 h-3.5" />,
          classes: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        };
      case "user_logout":
        return {
          label: "Logout",
          icon: <LogOut className="w-3.5 h-3.5" />,
          classes: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        };
      default:
        return {
          label: action,
          icon: <Activity className="w-3.5 h-3.5" />,
          classes: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
        };
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

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
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "activity"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Activity className="w-4 h-4" />
            Activity Log
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
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
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-100">Activity Log</h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Secure audit history of your profile actions and login sessions.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-300 disabled:opacity-50 transition"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-purple-400" : ""}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-6">
                {[...Array(size)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse border border-slate-800/60" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-red-500/30 rounded-xl bg-red-500/5">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <span className="text-sm font-medium text-slate-300">Failed to load activity logs</span>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition"
                >
                  Try Again
                </button>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="text-sm text-slate-400 font-medium">No recorded activities found.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                  <div className="divide-y divide-slate-800/60">
                    {data.data.map((log) => {
                      const badge = getActionBadge(log.action);
                      const isExpanded = expandedLogIds.has(log.id);

                      return (
                        <div key={log.id} className="p-4 hover:bg-slate-900/30 transition flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.classes}`}>
                                {badge.icon}
                                {badge.label}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatTimestamp(log.created_at)}
                              </span>
                            </div>

                            {log.details && Object.keys(log.details).length > 0 && (
                              <button
                                onClick={() => toggleExpandLog(log.id)}
                                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition"
                              >
                                <Info className="w-3.5 h-3.5" />
                                {isExpanded ? "Hide Details" : "View Details"}
                              </button>
                            )}
                          </div>

                          {isExpanded && log.details && (
                            <div className="mt-1 border-t border-slate-800/40 pt-2 animate-fadeIn">
                              <pre className="font-mono text-[11px] text-slate-300 p-3 bg-slate-950/80 border border-slate-850 rounded-lg overflow-x-auto max-w-full">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                  <span className="text-xs text-slate-500">
                    Showing page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total logs)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isFetching}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, data.pagination.pages))}
                      disabled={page >= data.pagination.pages || isFetching}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
