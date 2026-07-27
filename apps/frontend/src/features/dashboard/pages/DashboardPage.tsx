import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FolderGit2, 
  CheckSquare, 
  Users, 
  Plus, 
  UserPlus, 
  FileText, 
  AlertCircle, 
  Calendar,
  Clock
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

  // Quick Action Form state (simple local states for demo infrastructure)
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Medium");
  const [inviteEmail, setInviteEmail] = useState("");

  // Queries
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardApi.getOverview().then((res) => res.data),
  });

  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list().then((res) => res.data),
  });

  // Load tasks for first project if available
  const firstProjectId = projects && projects.length > 0 ? projects[0].id : null;
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "list", firstProjectId],
    queryFn: () => {
      if (!firstProjectId) return Promise.resolve([]);
      return tasksApi.list(firstProjectId).then((res) => res.data);
    },
    enabled: !!firstProjectId,
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["tasks", "list", firstProjectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
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
        status: "Todo" as TaskStatus,
        priority: taskPriority,
      },
    });
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    // Mock user invitation
    toast.success("Invitation Sent", `An invite link has been dispatched to ${inviteEmail}`);
    setIsInviteOpen(false);
    setInviteEmail("");
  };

  const showLoader = statsLoading || projectsLoading;

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back, <span className="font-bold text-foreground">{user?.name}</span>. Workspace performance checks look stable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsProjectOpen(true)}
            className="h-8 gap-1 px-3 text-[11px] font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Project
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!projects || projects.length === 0}
            onClick={() => {
              if (projects && projects.length > 0) {
                setTaskProject(projects[0].id);
              }
              setIsTaskOpen(true);
            }}
            className="h-8 gap-1 px-3 text-[11px] font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Task
          </Button>
          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="h-8 gap-1 px-3 text-[11px] font-semibold"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
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
            <StatCard
              title="Total Projects"
              value={stats?.projects_count ?? projects?.length ?? 0}
              description="Active collaborative workspaces"
              trend={{ value: "Stable", type: "neutral" }}
            />
            <StatCard
              title="Active Tasks"
              value={stats?.tasks_count ?? tasks?.length ?? 0}
              description="Assigned backlog and board cards"
              trend={{ value: "+4.2%", type: "up" }}
            />
            <StatCard
              title="Completed Tasks"
              value={stats?.completed_tasks ?? 0}
              description="Archived and resolved tasks"
              trend={{ value: "+12%", type: "up" }}
            />
            <StatCard
              title="Pending Tasks"
              value={stats?.pending_tasks ?? 0}
              description="Tasks waiting developer review"
              trend={{ value: "-8.4%", type: "up" }}
            />
          </>
        )}
      </div>

      {/* Primary Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects and My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Card */}
          <Card className="border border-border/80 bg-card/45 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
                <CardTitle>Recent Projects</CardTitle>
              </div>
              {projects && projects.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-2">
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !projects || projects.length === 0 ? (
                <EmptyState
                  title="No active projects"
                  description="Begin tracking collaborations by establishing your first project workspace."
                  icon={FolderGit2}
                  action={
                    <Button size="sm" onClick={() => setIsProjectOpen(true)} className="h-8 text-[11px] font-semibold">
                      Create Project
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground font-bold">
                        <th className="pb-2 font-semibold">Project Name</th>
                        <th className="pb-2 font-semibold">Description</th>
                        <th className="pb-2 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/25">
                      {projects.slice(0, 3).map((proj) => (
                        <tr key={proj.id} className="hover:bg-accent/10">
                          <td className="py-2.5 font-bold text-foreground">{proj.name}</td>
                          <td className="py-2.5 text-muted-foreground truncate max-w-[200px]">{proj.description}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
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
          <Card className="border border-border/80 bg-card/45 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                <CardTitle>My Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <EmptyState
                  title="No assigned tasks"
                  description="Tasks added to workspaces will display here as active cards."
                  icon={CheckSquare}
                />
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-border/60 bg-card/10 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground leading-snug">{task.title}</span>
                        <span className="text-[10px] text-muted-foreground">Priority: {task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar panels: Recent Activity & Deadlines */}
        <div className="space-y-6">
          {/* Recent Activity Timeline */}
          <Card className="border border-border/80 bg-card/45 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No recent workspace logs recorded.
                </p>
              ) : (
                <div className="relative pl-4 border-l border-border/60 space-y-4 py-2">
                  {notifications.slice(0, 4).map((notif) => (
                    <div key={notif.id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">{notif.title}</span>
                        <span className="text-[10px] text-muted-foreground leading-normal">{notif.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="border border-border/80 bg-card/45 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <CardTitle>Upcoming Deadlines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No approaching task deadlines.</p>
              ) : (
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.dueDate)
                    .slice(0, 3)
                    .map((task) => (
                      <div key={task.id} className="flex items-center justify-between text-xs p-2 border border-border/40 bg-card/5 rounded">
                        <span className="font-bold text-foreground truncate max-w-[120px]">{task.title}</span>
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {task.dueDate}
                        </span>
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
        <form onSubmit={handleCreateProject} className="space-y-4">
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
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsProjectOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <FormField>
            <FormLabel required>Project Target</FormLabel>
            <Select
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
              disabled={createTaskMutation.isPending}
              options={(projects || []).map((p) => ({ value: p.id, label: p.name }))}
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
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Urgent", label: "Urgent" },
              ]}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsTaskOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Workspace Member">
        <form onSubmit={handleInviteMember} className="space-y-4">
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
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
export default DashboardPage;
