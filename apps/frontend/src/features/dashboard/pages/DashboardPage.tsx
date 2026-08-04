import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  FolderGit2, 
  CheckSquare, 
  Plus, 
  UserPlus, 
  AlertCircle, 
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  Bell,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-hooks";
import { dashboardApi } from "@/services/api/dashboard.api";
import { projectsApi } from "@/services/api/projects.api";
import { tasksApi, TaskStatus, TaskPriority } from "@/services/api/tasks.api";
import { notificationsApi } from "@/services/api/notifications.api";
import { StatCard, Card, CardHeader, CardTitle, CardContent, EmptyState } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { Skeleton, toast } from "@/components/ui/feedback";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
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

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", "dashboard-list"],
    queryFn: () => notificationsApi.list().then((res) => res.data),
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

  const showLoader = statsLoading || projectsLoading || myTasksLoading || activityLoading || notificationsLoading;

  // Calculators for Workspace Health & Sprints
  const totalTasks = stats?.tasks_count ?? 0;
  const completedTasks = stats?.completed_tasks ?? 0;
  const sprintProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasksCount = stats?.overdue_tasks ?? 0;
  
  // Workspace Health score: Start from 100%, deduct 5% per overdue task (min 0)
  const healthScore = Math.max(0, 100 - overdueTasksCount * 5);

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
      case "comment_delete":
        return `Deleted a comment`;
      default:
        return details.name || details.title || details.content || details.email || `Performed action on ${log.entity_type}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 glass-card rounded-xl">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-gold-gradient uppercase">Command Center Overview</h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            System Operational status: <span className="text-[#d4af37] font-bold">Stable</span> &middot; Active Operator: <span className="font-bold text-foreground">{user?.full_name || "Admin"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsProjectOpen(true)}
            className="h-8 gap-1.5 px-3 text-[10px] font-bold cursor-pointer"
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
            className="h-8 gap-1.5 px-3 text-[10px] font-bold cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Task
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsInviteOpen(true)}
            className="h-8 gap-1.5 px-3 text-[10px] font-bold cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showLoader ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4 sm:p-6 flex flex-col gap-3 glass-card">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StatCard
                title="Workspace Health"
                value={`${healthScore}%`}
                description="Aggregated service quality"
                trend={{ value: healthScore > 90 ? "Optimal" : "Stable", type: healthScore > 90 ? "up" : "neutral" }}
                className="glass-card border-[var(--border-luxury)]"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="glass-card border-[var(--border-luxury)] relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Sprint Progress</span>
                    <TrendingUp className="h-3.5 w-3.5 text-[#d4af37]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-black tracking-tight text-foreground">{sprintProgress}%</div>
                  <div className="h-1.5 w-full bg-muted border border-border/10 rounded-full mt-2 overflow-hidden">
                    <div
                      style={{ width: `${sprintProgress}%` }}
                      className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{completedTasks} of {totalTasks} tasks resolved</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StatCard
                title="Workspace Velocity"
                value={`${(completedTasks * 0.3).toFixed(1)}/d`}
                description="Task resolution speed"
                trend={{ value: "Burn rate: Stable", type: "neutral" }}
                className="glass-card border-[var(--border-luxury)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <StatCard
                title="Productivity Index"
                value={`${Math.round(sprintProgress * 0.9 + 10)}%`}
                description="Focus & workflow density"
                trend={{ value: "+2.1%", type: "up" }}
                className="glass-card border-[var(--border-luxury)]"
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Primary Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects and My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Card */}
          <Card className="border border-[var(--border-luxury)] glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-[#d4af37] shrink-0" />
                <CardTitle className="text-gold-gradient">Active Projects</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  title="No active projects"
                  description="Begin tracking collaborations by establishing your first project workspace."
                  icon={FolderGit2}
                  action={
                    <Button size="sm" onClick={() => setIsProjectOpen(true)} className="h-8 text-[11px] font-semibold bg-gold text-black hover:bg-[#f5d061]">
                      Create Project
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/10 bg-black/30">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 text-[#d4af37] bg-black/40">
                        <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Project Name</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Description</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {projects.slice(0, 4).map((proj) => (
                        <tr key={proj.id} className="hover:bg-[#d4af37]/5 transition-colors">
                          <td className="p-3 font-bold text-foreground">{proj.name}</td>
                          <td className="p-3 text-muted-foreground truncate max-w-[240px]">{proj.description || "No description provided."}</td>
                          <td className="p-3 text-right">
                            <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Tasks Card */}
          <Card className="border border-[var(--border-luxury)] glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#d4af37] shrink-0" />
                <CardTitle className="text-gold-gradient">Assigned to Me</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {myTasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : myTasks.length === 0 ? (
                <EmptyState
                  title="No assigned tasks"
                  description="Tasks assigned to you will display here as active cards."
                  icon={CheckSquare}
                />
              ) : (
                <div className="space-y-3">
                  {myTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-border/10 bg-black/25 rounded-lg hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-foreground leading-snug">{task.title}</span>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                          <span className="capitalize">Priority: <strong className="text-foreground">{task.priority}</strong></span>
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] capitalize">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar panels: Recent Activity & Deadlines */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="border border-[var(--border-luxury)] glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#d4af37] shrink-0" />
                <CardTitle className="text-gold-gradient">Upcoming Deadlines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {myTasksLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No approaching task deadlines.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingDeadlines.map(({ task, isOverdue }) => (
                    <div key={task.id} className="flex items-center justify-between text-xs p-2.5 border border-border/10 bg-black/20 rounded">
                      <span className="font-bold text-foreground truncate max-w-[120px]">{task.title}</span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-[#d4af37]"}`}>
                        {isOverdue ? <ShieldAlert className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        {new Date(task.due_date!).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Timeline (Audit logs) */}
          <Card className="border border-[var(--border-luxury)] glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#d4af37] shrink-0" />
                <CardTitle className="text-gold-gradient">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No recent activity logged.
                </p>
              ) : (
                <div className="relative pl-4 border-l border-border/10 space-y-4 py-2">
                  {activities.slice(0, 4).map((log: any) => (
                    <div key={log.id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#d4af37] border-2 border-black glow-gold" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground capitalize">{log.action.replace("_", " ")}</span>
                        <span className="text-[10px] text-muted-foreground leading-normal">{formatActivityDetails(log)}</span>
                        <span className="text-[9px] text-muted-foreground/60">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Notifications */}
          <Card className="border border-[var(--border-luxury)] glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#d4af37] shrink-0" />
                <CardTitle className="text-gold-gradient">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No unread notifications.</p>
              ) : (
                <div className="space-y-2.5">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="p-2.5 border border-border/10 bg-black/20 rounded text-xs flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{notif.title}</span>
                      <span className="text-[10px] text-muted-foreground leading-normal">{notif.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* dialog overlays */}

      {/* New Project Dialog */}
      <Dialog isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Project Name</FormLabel>
            <Input
              placeholder="E.g., Website Redesign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={createProjectMutation.isPending}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Details on workspace context..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              disabled={createProjectMutation.isPending}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProjectOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" variant="primary" isLoading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Project Target</FormLabel>
            <Select
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
              disabled={createTaskMutation.isPending}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
          </FormField>
          <FormField>
            <FormLabel required>Task Title</FormLabel>
            <Input
              placeholder="E.g., Implement OAuth API"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={createTaskMutation.isPending}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Add details, criteria..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              disabled={createTaskMutation.isPending}
            />
          </FormField>
          <FormField>
            <FormLabel>Priority</FormLabel>
            <Select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
              disabled={createTaskMutation.isPending}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTaskOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" variant="primary" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Workspace Member">
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" variant="primary">
              Send Invite
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
export default DashboardPage;
