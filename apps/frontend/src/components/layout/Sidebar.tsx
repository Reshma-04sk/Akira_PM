import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  ArrowLeftRight,
  LogOut
} from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useAuth } from "@/features/auth/auth-hooks";
import { Avatar } from "@/components/ui/data-display";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  className,
}) => {
  return (
    <aside
      className={cn(
        "shrink-0 flex flex-col justify-between transition-all duration-300 relative select-none glass-sidebar border-[#d4af37]/15",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      aria-label="Primary Navigation"
    >
      {/* Toggle button overlay */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 h-6 w-6 rounded-full border border-white/10 bg-black flex items-center justify-center text-muted-foreground hover:text-[#d4af37] hover:border-[#d4af37]/35 shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all focus:outline-none focus:ring-1 focus:ring-[#d4af37] z-10 cursor-pointer hidden md:flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ArrowLeftRight className="h-3 w-3" />
      </button>

      {/* Top Section */}
      <div className="flex flex-col flex-1 gap-6 overflow-y-auto p-3">
        {/* Workspace selector */}
        <div className="h-12 flex items-center justify-center overflow-hidden border-b border-white/5 pb-2">
          {isCollapsed ? (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#ab8836] to-[#f5d061] text-black flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(212,175,55,0.3)] shrink-0">
              A
            </div>
          ) : (
            <div className="w-full">
              <WorkspaceSwitcher />
            </div>
          )}
        </div>

        {/* Sidebar Items navigation */}
        <nav className="space-y-6 flex-1" aria-label="Main Navigation">
          <SidebarGroup label="General" isCollapsed={isCollapsed}>
            <SidebarItem
              to="/dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              to="/projects"
              label="Projects"
              icon={FolderGit2}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              to="/tasks"
              label="Tasks"
              icon={CheckSquare}
              isCollapsed={isCollapsed}
            />
          </SidebarGroup>

          <SidebarGroup label="Collaborate" isCollapsed={isCollapsed}>
            <SidebarItem
              to="/calendar"
              label="Calendar"
              icon={Calendar}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              to="/reports"
              label="Reports"
              icon={BarChart3}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              to="/teams"
              label="Teams"
              icon={Users}
              isCollapsed={isCollapsed}
            />
          </SidebarGroup>
        </nav>
      </div>

      {/* Footer Section */}
      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
};

// Auxiliary Sidebar Items & Elements

interface SidebarGroupProps {
  label: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  label,
  isCollapsed,
  children,
}) => {
  return (
    <div className="space-y-1.5">
      {!isCollapsed && (
        <span className="px-3 text-[9px] font-black text-[#d4af37]/65 uppercase tracking-[0.15em] block mb-1">
          {label}
        </span>
      )}
      <ul className="space-y-1" role="list">
        {children}
      </ul>
    </div>
  );
};

interface SidebarItemProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isCollapsed: boolean;
}

const prefetchRoute = (to: string) => {
  switch (to) {
    case "/dashboard":
      import("@/features/dashboard/pages/DashboardPage");
      break;
    case "/projects":
      import("@/features/projects/pages/ProjectsListPage");
      break;
    case "/tasks":
      import("@/features/tasks/pages/TasksListPage");
      break;
    case "/calendar":
      import("@/features/calendar/pages/CalendarPage");
      break;
    case "/reports":
      import("@/features/reports/pages/ReportsPage");
      break;
    case "/teams":
      import("@/features/teams/pages/TeamsPage");
      break;
    case "/settings":
      import("@/features/settings/pages/SettingsPage");
      break;
    default:
      break;
  }
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  label,
  icon: Icon,
  isCollapsed,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li role="presentation" className="relative flex items-center">
      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 w-0.75 h-5 rounded-r bg-[#d4af37] shadow-[0_0_8px_#d4af37] z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Link
        to={to}
        onMouseEnter={() => prefetchRoute(to)}
        onFocus={() => prefetchRoute(to)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37] leading-none hover:text-white hover:bg-white/5 w-full",
          isActive
            ? "bg-[#d4af37]/8 text-[#d4af37] font-bold border-l-2 border-transparent"
            : "text-muted-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-[#d4af37]" : "text-muted-foreground/80")} />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </Link>
    </li>
  );
};

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isSettingsActive = location.pathname === "/settings";

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="p-3 border-t border-white/5 bg-[#080808]/40 space-y-2">
      {/* Settings Link */}
      <Link
        to="/settings"
        onMouseEnter={() => prefetchRoute("/settings")}
        onFocus={() => prefetchRoute("/settings")}
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37] leading-none hover:text-white hover:bg-white/5 w-full",
          isSettingsActive ? "bg-[#d4af37]/8 text-[#d4af37] font-bold" : "text-muted-foreground"
        )}
      >
        <Settings className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="truncate">Settings</span>}
      </Link>

      {/* User Info Block */}
      <div className={cn("flex items-center gap-2 px-1.5 py-1.5 rounded-xl bg-white/5 border border-white/5", isCollapsed ? "justify-center" : "justify-between")}>
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            fallback={initials}
            src={user?.avatar_url || undefined}
            className="h-7 w-7 border-white/10 bg-gradient-to-br from-[#ab8836]/20 to-[#f5d061]/20 text-[#d4af37] shrink-0 text-[10px]"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[10px] font-bold text-foreground truncate">
                {user?.full_name || "User Admin"}
              </span>
              <span className="text-[8px] text-muted-foreground truncate font-mono">
                {user?.email || "admin@akira-pm.com"}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && logout && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                logout();
              }
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
