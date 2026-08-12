import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  FolderGit2, 
  CheckSquare, 
  Plus, 
  UserPlus, 
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  Inbox,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { dashboardApi } from "@/services/api/dashboard.api";
import { projectsApi } from "@/services/api/projects.api";
import { tasksApi, TaskStatus, TaskPriority } from "@/services/api/tasks.api";
import { Card, EmptyState } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { Skeleton, toast } from "@/components/ui/feedback";
import { VelocityChart } from "../components/VelocityChart";

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Quick Action Form state
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [inviteEmail, setInviteEmail] = useState("");

  // Queries
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardApi.getOverview().then((res) => res.data),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: () => dashboardApi.getAnalytics().then((res) => res.data),
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const { data: activityResponse, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => dashboardApi.getActivity(10).then((res) => res.data),
  });
  const activities = activityResponse?.activities || [];

  const { data: myTasksResponse, isLoading: myTasksLoading } = useQuery({
    queryKey: ["dashboard", "my-tasks"],
    queryFn: () => dashboardApi.getMyTasks(1, 100).then((res) => res.data),
  });
  const myTasks = myTasksResponse?.items || [];

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project created", `Successfully created project "${projectName}"`);
      setIsProjectOpen(false);
      setProjectName("");
      setProjectDesc("");
    },
    onError: (err: any) => {
      toast.error("Failed to create project", err.message);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: any }) =>
      tasksApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task created", `Successfully created task "${taskTitle}"`);
      setIsTaskOpen(false);
      setTaskTitle("");
      setTaskDesc("");
    },
    onError: (err: any) => {
      toast.error("Failed to create task", err.message);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    createProjectMutation.mutate({ name: projectName, description: projectDesc });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProject) return;
    createTaskMutation.mutate({
      projectId: taskProject,
      payload: {
        title: taskTitle,
        description: taskDesc,
        status: "todo" as TaskStatus,
        priority: taskPriority,
      },
    });
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    toast.success("Invitation Sent", `An invite link has been dispatched to ${inviteEmail}`);
    setIsInviteOpen(false);
    setInviteEmail("");
  };

  const showLoader = statsLoading || projectsLoading || myTasksLoading || activityLoading || analyticsLoading;

  // Calculators for Real Data Metrics
  const totalTasks = stats?.tasks_count ?? 0;
  const completedTasks = stats?.completed_tasks ?? 0;
  const overdueTasksCount = stats?.overdue_tasks ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter My Tasks for overdue and upcoming deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDeadlines = myTasks
    .filter(t => t.due_date && t.status !== "done")
    .map(t => {
      const dueDate = new Date(t.due_date!);
      dueDate.setHours(0,0,0,0);
      return { task: t, isOverdue: dueDate < today };
    })
    .sort((a, b) => new Date(a.task.due_date!).getTime() - new Date(b.task.due_date!).getTime())
    .slice(0, 4);

  const formatActivityDetails = (log: any) => {
    if (!log.details) return `Performed on ${log.entity_type}`;
    if (typeof log.details === "string") return log.details;
    const details = log.details;
    switch (log.action) {
      case "project_create":
        return `Created project "${details.name || details.title || log.entity_id}"`;
      case "project_update":
        return `Updated project "${details.name || details.title || log.entity_id}"`;
      case "project_delete":
        return `Deleted project "${details.name || details.title || log.entity_id}"`;
      case "task_create":
        return `Created task "${details.title || details.name || log.entity_id}"`;
      case "task_update":
        return `Updated task "${details.title || details.name || log.entity_id}"`;
      case "task_delete":
        return `Deleted task "${details.title || details.name || log.entity_id}"`;
      case "member_invite":
        return `Invited member "${details.email || details.name || log.entity_id}"`;
      case "member_remove":
        return `Removed member "${details.email || details.name || log.entity_id}"`;
      case "comment_create":
        return `Added comment: "${details.content || log.entity_id}"`;
      default:
        return details.name || details.title || details.content || details.email || `Performed action on ${log.entity_type}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-card border border-border rounded-xl shadow-sm">
        <div>
          <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
            Command Console &middot; Workspace Telemetry
          </span>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsProjectOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-semibold cursor-pointer border-border"
          >
            <Plus className="h-3.5 w-3.5" />
            Project
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={projects.length === 0}
            onClick={() => {
              if (projects.length > 0) {
                setTaskProject(projects[0].id);
              }
              setIsTaskOpen(true);
            }}
            className="h-8 gap-1.5 px-3 text-xs font-semibold cursor-pointer border-border"
          >
            <Plus className="h-3.5 w-3.5" />
            Task
          </Button>
          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-bold cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Defensible Data-Driven KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showLoader ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4 sm:p-6 flex flex-col gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </Card>
          ))
        ) : statsError ? (
          <div className="col-span-full border border-destructive/20 bg-destructive/5 rounded-xl p-4 text-center text-xs text-destructive font-semibold">
            Failed to load workspace statistics. Please check your connectivity.
          </div>
        ) : (
          <>
            {/* 1. Overdue Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Overdue Tasks</span>
                  {overdueTasksCount > 0 ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {overdueTasksCount}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    overdueTasksCount > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-accent/10 text-accent"
                  }`}>
                    {overdueTasksCount > 0 ? "Attention Required" : "Clean"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">
                  Tasks past target due date
                </p>
              </Card>
            </motion.div>
            
            {/* 2. Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Card className="p-5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Completion Rate</span>
                  <TrendingUp className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-foreground mt-1">{completionRate}%</div>
                <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden border border-border">
                  <div
                    style={{ width: `${completionRate}%` }}
                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">
                  {completedTasks} of {totalTasks} tasks resolved
                </p>
              </Card>
            </motion.div>

            {/* 3. Avg Cycle Time */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Card className="p-5 flex flex-col gap-1">
                <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Avg Cycle Time
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {analytics?.avg_cycle_time_days !== null && analytics?.avg_cycle_time_days !== undefined
                      ? `${analytics.avg_cycle_time_days}d`
                      : "—"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">created &rarr; done</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">
                  {analytics?.avg_cycle_time_days !== null ? "Average task resolution speed" : "Not enough completed tasks"}
                </p>
              </Card>
            </motion.div>

            {/* 4. Resolved Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <Card className="p-5 flex flex-col gap-1">
                <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Resolved Tasks
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {completedTasks}
                  </span>
                  <span className="text-[10px] font-mono text-accent font-bold">Shipped</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">
                  Out of {totalTasks} total registered tasks
                </p>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Velocity Analytics Chart */}
      <VelocityChart />

      {/* Primary Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects and My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Card */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-accent shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Active Projects ({projects.length})
                </h3>
              </div>
            </div>

            {projectsLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                title="No active projects"
                description="Begin tracking collaborations by establishing your first project workspace."
                icon={FolderGit2}
                action={
                  <Button size="sm" onClick={() => setIsProjectOpen(true)} className="h-8 text-xs font-semibold bg-accent text-accent-foreground">
                    Create Project
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 font-mono text-[9px] text-muted-foreground uppercase tracking-wider select-none">
                      <th className="py-3 px-5 font-bold">Project Name</th>
                      <th className="py-3 px-5 font-bold">Description</th>
                      <th className="py-3 px-5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {projects.slice(0, 4).map((proj) => (
                      <tr key={proj.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-foreground">{proj.name}</td>
                        <td className="py-3.5 px-5 text-muted-foreground truncate max-w-[240px]">
                          {proj.description || "No description provided."}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="font-mono text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Assigned to Me Card */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Assigned to Me ({myTasks.length})
                </h3>
              </div>
            </div>

            <div className="p-5">
              {myTasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : myTasks.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/50 stroke-[1.5]" />
                  <h4 className="text-xs font-bold text-foreground">No active work assigned</h4>
                  <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                    Tasks assigned to you will appear here once work starts.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-border bg-card rounded-lg hover:border-accent/40 transition-all"
                    >
                      <div className="flex flex-col gap-1 min-w-0 pr-3">
                        <span className="text-xs font-bold text-foreground truncate">{task.title}</span>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
                          <span>Priority: <strong className="text-foreground uppercase">{task.priority}</strong></span>
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-accent" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-border bg-secondary text-foreground capitalize shrink-0">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Panels: Recent Activity Timeline & Deadlines */}
        <div className="space-y-6">
          {/* Recent Activity Timeline */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Activity className="h-4 w-4 text-accent shrink-0" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Recent Activity
              </h3>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Activity will appear here as your team works.</p>
            ) : (
              <div className="relative pl-3 space-y-4 border-l border-border ml-1.5 pt-1">
                {activities.slice(0, 6).map((log: any, idx: number) => (
                  <div key={log.id || idx} className="relative group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-accent ring-4 ring-background" />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground capitalize">
                          {log.action?.replace("_", " ") || "System Event"}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        {formatActivityDetails(log)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="h-4 w-4 text-accent shrink-0" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Upcoming Deadlines
              </h3>
            </div>

            {myTasksLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">No upcoming task deadlines</p>
                <p className="text-[10px] text-muted-foreground font-mono">Tasks with target due dates will appear here</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(({ task, isOverdue }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary text-xs"
                  >
                    <span className="font-semibold text-foreground truncate pr-2">{task.title}</span>
                    <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      isOverdue ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-accent/10 text-accent"
                    }`}>
                      {isOverdue ? "OVERDUE" : new Date(task.due_date!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Project Name</FormLabel>
            <Input
              placeholder="e.g. Infrastructure Modernization"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Outline high-level goals and milestones..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsProjectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={createProjectMutation.isPending} className="bg-accent text-accent-foreground">
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Create Task Card">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Target Project</FormLabel>
            <Select
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
          </FormField>
          <FormField>
            <FormLabel required>Task Title</FormLabel>
            <Input
              placeholder="e.g. Setup Redis Session Cache"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Priority Level</FormLabel>
            <Select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
              options={[
                { value: "low", label: "Low Priority" },
                { value: "medium", label: "Medium Priority" },
                { value: "high", label: "High Priority" },
                { value: "critical", label: "Critical Blocker" },
              ]}
            />
          </FormField>
          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Technical specifications or acceptance criteria..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={createTaskMutation.isPending} className="bg-accent text-accent-foreground">
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Operator to Workspace">
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Operator Email</FormLabel>
            <Input
              type="email"
              placeholder="colleague@akira.io"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-accent text-accent-foreground">
              Send Dispatch Link
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
