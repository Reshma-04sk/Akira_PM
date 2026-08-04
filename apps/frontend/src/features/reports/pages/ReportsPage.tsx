import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, 
  Printer, 
  Clock, 
  AlertCircle, 
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
  // Reset time part of now for clean day comparison
  now.setHours(0, 0, 0, 0);

  const overdueTasksList = tasks.filter((t: Task) => {
    if (!t.due_date || t.status === "done") return false;
    const dueDate = new Date(t.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  });

  // 3. Calculations - Due this week (next 7 days, including today)
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  const dueThisWeekList = tasks.filter((t: Task) => {
    if (!t.due_date || t.status === "done") return false;
    const dueDate = new Date(t.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= now && dueDate <= sevenDaysLater;
  });

  // 4. Calculations - Team Workload
  const workloadMap: Record<string, { name: string; count: number; completed: number }> = {};
  tasks.forEach((t: Task) => {
    const assigneeName = t.assignee ? t.assignee.full_name || t.assignee.email : "Unassigned";
    if (!workloadMap[assigneeName]) {
      workloadMap[assigneeName] = { name: assigneeName, count: 0, completed: 0 };
    }
    workloadMap[assigneeName].count += 1;
    if (t.status === "done") {
      workloadMap[assigneeName].completed += 1;
    }
  });
  const workloadList = Object.values(workloadMap).sort((a, b) => b.count - a.count);

  // 5. Calculations - Priority Distribution
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

  // Custom SVG donut chart calculations for priority
  const totalPriorityCount = Object.values(priorityCounts).reduce((a: number, b: number) => a + b, 0);
  const donutColors = {
    critical: "#d4af37", // radiant gold
    high: "#f5d061",     // soft champagne
    medium: "#ab8836",   // deep bronze
    low: "#5a4d2e",      // muted dark gold
  };

  let accumulatedPercent = 0;
  const donutSlices = Object.entries(priorityCounts).map(([priority, count]) => {
    const percent = totalPriorityCount > 0 ? (count / totalPriorityCount) * 100 : 0;
    // Circumference of r=50 circle is ~314.16
    const strokeDasharray = `${(percent * 314.16) / 100} 314.16`;
    const strokeDashoffset = `${-(accumulatedPercent * 314.16) / 100}`;
    accumulatedPercent += percent;
    return {
      priority,
      count,
      percent,
      color: donutColors[priority as keyof typeof donutColors],
      strokeDasharray,
      strokeDashoffset,
    };
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card rounded-xl p-4 no-print">
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
              className="h-8 gap-1.5 text-[11px] font-semibold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintPDF}
              disabled={showLoader}
              className="h-8 gap-1.5 text-[11px] font-semibold cursor-pointer text-black"
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

            {/* Project Progress Summary */}
            <Card className="border border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle>Project Completion Progress</CardTitle>
                  </div>
                  <span className="text-xs font-black text-foreground">{progressPercent}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full bg-muted border border-border/40 rounded-full overflow-hidden shadow-inner">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                  <span>0% Started</span>
                  <span>{completedTasks} of {totalTasks} Tasks Resolved</span>
                  <span>100% Completed</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tasks by Status Chart */}
              <Card className="border border-border/80 bg-card/45 backdrop-blur">
                <CardHeader>
                  <CardTitle>Tasks by Workflow Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center min-h-[220px]">
                  {totalTasks === 0 ? (
                    <div className="text-xs text-muted-foreground">No tasks to chart.</div>
                  ) : (
                    <div className="w-full flex items-end justify-around h-44 pt-6 pb-2 px-4 border-b border-border/40">
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
                            <div className="w-8 bg-white/5 rounded-t-lg relative h-32 flex items-end border border-white/5 overflow-hidden">
                              <div
                                style={{ height: `${heightPercent}%` }}
                                className="w-full bg-gradient-to-t from-[#ab8836] via-[#d4af37] to-[#f5d061] rounded-t-md transition-all duration-500 ease-out group-hover:opacity-90 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                              />
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity">
                                {count}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground truncate w-full text-center">
                              {displayLabels[status as keyof typeof displayLabels]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks by Priority Donut Chart */}
              <Card className="border border-border/80 bg-card/45 backdrop-blur">
                <CardHeader>
                  <CardTitle>Tasks by Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-8 min-h-[220px]">
                  {totalPriorityCount === 0 ? (
                    <div className="text-xs text-muted-foreground">No tasks to chart.</div>
                  ) : (
                    <>
                      {/* SVG Donut */}
                      <svg className="w-36 h-36 shrink-0" viewBox="0 0 160 160">
                        {donutSlices.map(
                          (slice, idx) =>
                            slice.percent > 0 && (
                              <circle
                                key={idx}
                                cx="80"
                                cy="80"
                                r="50"
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth="18"
                                strokeDasharray={slice.strokeDasharray}
                                strokeDashoffset={slice.strokeDashoffset}
                                transform="rotate(-90 80 80)"
                                className="transition-all duration-300"
                              />
                            )
                        )}
                        <circle cx="80" cy="80" r="41" fill="var(--card)" />
                        <text
                          x="80"
                          y="83"
                          textAnchor="middle"
                          className="fill-foreground font-black text-sm"
                        >
                          {totalPriorityCount} Tasks
                        </text>
                      </svg>

                      {/* Donut Legend */}
                      <div className="flex flex-col gap-2 w-full max-w-[150px]">
                        {donutSlices.map((slice) => (
                          <div key={slice.priority} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                              <span
                                style={{ backgroundColor: slice.color }}
                                className="h-2.5 w-2.5 rounded-full shrink-0 border border-border/20"
                              />
                              <span className="capitalize text-muted-foreground font-medium">
                                {slice.priority}
                              </span>
                            </div>
                            <span className="font-bold text-foreground">
                              {slice.count} ({Math.round(slice.percent)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Team Workload Section */}
            <Card className="border border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Team Workload Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {workloadList.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-4 text-center">
                    No active team member workload.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workloadList.map((item) => {
                      const maxTaskCount = workloadList[0]?.count || 1;
                      const percentage = Math.round((item.count / maxTaskCount) * 100);

                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">{item.name}</span>
                            <span className="text-muted-foreground font-medium">
                              {item.count} tasks ({item.completed} completed)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="h-full bg-primary/70 rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lists Section: Overdue and Due this week */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overdue Tasks */}
              <Card className="border border-border/80 bg-card/45 backdrop-blur">
                <CardHeader className="border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <CardTitle>Overdue Backlog</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 max-h-72 overflow-y-auto">
                  {overdueTasksList.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No overdue tasks found. Nice job!
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {overdueTasksList.map((t: Task) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 border border-destructive/20 bg-destructive/5 rounded-lg text-xs"
                        >
                          <div className="flex flex-col gap-0.5 max-w-[180px]">
                            <span className="font-bold text-foreground truncate">{t.title}</span>
                            <span className="text-[9px] text-muted-foreground">
                              Assignee: {t.assignee ? t.assignee.full_name || t.assignee.email : "Unassigned"}
                            </span>
                          </div>
                          <span className="text-[10px] text-destructive font-bold">
                            {t.due_date ? t.due_date.split("T")[0] : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Due This Week */}
              <Card className="border border-border/80 bg-card/45 backdrop-blur">
                <CardHeader className="border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <CardTitle>Due This Week</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 max-h-72 overflow-y-auto">
                  {dueThisWeekList.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No tasks due this week.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {dueThisWeekList.map((t: Task) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 border border-border/60 bg-card/5 rounded-lg text-xs"
                        >
                          <div className="flex flex-col gap-0.5 max-w-[180px]">
                            <span className="font-bold text-foreground truncate">{t.title}</span>
                            <span className="text-[9px] text-muted-foreground">
                              Assignee: {t.assignee ? t.assignee.full_name || t.assignee.email : "Unassigned"}
                            </span>
                          </div>
                          <span className="text-[10px] text-primary font-bold">
                            {t.due_date ? t.due_date.split("T")[0] : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ReportsPage;
