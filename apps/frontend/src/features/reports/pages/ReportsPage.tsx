import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, 
  Printer, 
  TrendingUp 
} from "lucide-react";
import { projectsApi } from "@/services/api/projects.api";
import { dashboardApi } from "@/services/api/dashboard.api";
import { tasksApi } from "@/services/api/tasks.api";
import type { Task } from "@/services/api/tasks.api";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/selection";
import { Skeleton, toast } from "@/components/ui/feedback";
import { VelocityChart } from "@/features/dashboard/components/VelocityChart";

export const ReportsPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Queries - Projects list
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  // Handle setting default project ID
  React.useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Queries - Project Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["project-stats", selectedProjectId],
    queryFn: () => {
      if (!selectedProjectId) return Promise.resolve(null);
      return dashboardApi.getProjectStats(selectedProjectId).then((res) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  // Queries - Tasks list (up to 100)
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "list", { projectId: selectedProjectId, pageSize: 100 }],
    queryFn: () => {
      if (!selectedProjectId) {
        return Promise.resolve({ items: [], total: 0, page: 1, page_size: 100 } as any);
      }
      return tasksApi.list({
        project_id: selectedProjectId,
        page_size: 100,
      }).then((res: any) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  const tasks: Task[] = (tasksResponse as any)?.items || [];

  // 1. Calculations - Progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === "done").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Calculations - Overdue
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdueTasksList = tasks.filter((t: Task) => {
    if (!t.due_date || t.status === "done") return false;
    const dueDate = new Date(t.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  });

  // 3. Calculations - Priority Distribution
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  tasks.forEach((t: Task) => {
    if (t.priority in priorityCounts) {
      priorityCounts[t.priority as keyof typeof priorityCounts] += 1;
    }
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error("Export Failed", "There are no tasks to export.");
      return;
    }

    const headers = ["ID", "Title", "Status", "Priority", "Assignee", "Due Date", "Created At"];
    const rows = tasks.map((t: Task) => [
      t.id,
      t.title,
      t.status,
      t.priority,
      t.assignee ? t.assignee.full_name || t.assignee.email : "Unassigned",
      t.due_date && typeof t.due_date === "string" ? t.due_date.split("T")[0] : "",
      t.created_at && typeof t.created_at === "string" ? t.created_at.split("T")[0] : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: (string | null)[]) =>
        row.map((val: string | null) => `"${String(val || "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const selectedProjectName = projects?.find((p) => p.id === selectedProjectId)?.name || "project";
    const filename = `${selectedProjectName.toLowerCase().replace(/\s+/g, "_")}_report.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported", `Saved task report as ${filename}`);
  };

  // Export PDF Handler
  const handlePrintPDF = () => {
    window.print();
  };

  const projectOptions = (projects || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const showLoader = projectsLoading || statsLoading || tasksLoading;

  return (
    <div className="space-y-6 select-none animate-in fade-in-30 duration-200">
      {/* Printable Area Wrapper for window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="print-area" className="space-y-6">
        {/* Reports Header & Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-xl p-4 no-print shadow-sm">
          <div className="w-60">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={projectOptions}
              disabled={projectsLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              disabled={showLoader || tasks.length === 0}
              className="h-8 gap-1.5 text-xs font-semibold cursor-pointer border-border"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handlePrintPDF}
              disabled={showLoader}
              className="h-8 gap-1.5 text-xs font-bold cursor-pointer bg-accent text-accent-foreground"
            >
              <Printer className="h-3.5 w-3.5" />
              Export PDF / Print
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:flex flex-col gap-1 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Project Performance Report</h1>
          <p className="text-xs text-gray-500">
            Project: {projects?.find((p) => p.id === selectedProjectId)?.name || ""} &middot; Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {showLoader ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="p-4 sm:p-6 flex flex-col gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Tasks"
                value={stats?.tasks_count ?? totalTasks}
                description="Total tasks registered"
                trend={{ value: "KPI", type: "neutral" }}
              />
              <StatCard
                title="Completed Tasks"
                value={stats?.completed_tasks ?? completedTasks}
                description={`${progressPercent}% completion rate`}
                trend={{ value: `${progressPercent}%`, type: "up" }}
              />
              <StatCard
                title="Pending Backlog"
                value={stats?.pending_tasks ?? (totalTasks - completedTasks)}
                description="Backlog workflow cards"
                trend={{ value: "Active", type: "neutral" }}
              />
              <StatCard
                title="Overdue Tasks"
                value={stats?.overdue_tasks ?? overdueTasksList.length}
                description="Tasks past target due dates"
                trend={{
                  value: (stats?.overdue_tasks ?? overdueTasksList.length) > 0 ? "Warning" : "Clean",
                  type: (stats?.overdue_tasks ?? overdueTasksList.length) > 0 ? "down" : "up",
                }}
              />
            </div>

            {/* Velocity Analytics Chart */}
            <VelocityChart />

            {/* Project Progress Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <CardTitle>Project Completion Progress</CardTitle>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">{progressPercent}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-secondary border border-border rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mt-2">
                  <span>0% Started</span>
                  <span>{completedTasks} of {totalTasks} Tasks Resolved</span>
                  <span>100% Completed</span>
                </div>
              </CardContent>
            </Card>

            {/* Tasks by Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Workflow Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[220px]">
                {totalTasks === 0 ? (
                  <div className="font-mono text-xs text-muted-foreground">No tasks in project.</div>
                ) : (
                  <div className="w-full flex items-end justify-around h-44 pt-6 pb-2 px-4 border-b border-border">
                    {["todo", "in_progress", "in_review", "done"].map((status) => {
                      const count = tasks.filter((t: Task) => t.status === status).length;
                      const heightPercent = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                      const displayLabels = {
                        todo: "To Do",
                        in_progress: "In Progress",
                        in_review: "In Review",
                        done: "Done",
                      };

                      return (
                        <div key={status} className="flex flex-col items-center gap-2 w-16 group">
                          <div className="w-8 bg-secondary rounded-t-lg relative h-32 flex items-end border border-border overflow-hidden">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-accent rounded-t-md transition-all duration-500 ease-out group-hover:opacity-90"
                            />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                              {count}
                            </span>
                          </div>
                          <span className="font-mono text-[9px] font-bold text-muted-foreground truncate w-full text-center">
                            {displayLabels[status as keyof typeof displayLabels]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
