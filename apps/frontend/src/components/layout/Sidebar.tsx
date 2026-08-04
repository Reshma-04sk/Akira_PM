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
  ArrowLeftRight
} from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
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
        "h-screen shrink-0 border-r border-border bg-card/45 backdrop-blur flex flex-col justify-between transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      aria-label="Primary Navigation"
    >
      {/* Toggle button overlay */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground shadow hover:shadow-md transition-all focus:outline-none focus:ring-1 focus:ring-ring z-10 cursor-pointer hidden md:flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ArrowLeftRight className="h-3 w-3" />
      </button>

      {/* Top Section */}
      <div className="flex flex-col flex-1 gap-4 overflow-y-auto p-3">
        {/* Workspace selector */}
        <div className="h-10 flex items-center justify-center mb-2 overflow-hidden">
          {isCollapsed ? (
            <div className="h-8 w-8 rounded bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              F
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
    <div className="space-y-1">
      {!isCollapsed && (
        <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
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
    <li role="presentation">
      <Link
        to={to}
        onMouseEnter={() => prefetchRoute(to)}
        onFocus={() => prefetchRoute(to)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-accent/40 hover:text-accent-foreground transition-all select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-none",
          isActive
            ? "bg-accent/60 text-foreground font-bold border border-border/60"
            : "text-muted-foreground border border-transparent"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "")} />
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
  return (
    <div className="p-3 border-t border-border bg-card/10">
      <SidebarItem
        to="/settings"
        label="Settings"
        icon={Settings}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};
