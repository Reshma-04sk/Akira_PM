import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  FolderGit2, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText
} from "lucide-react";
import { projectsApi } from "@/services/api/projects.api";
import { tasksApi } from "@/services/api/tasks.api";
import { notificationsApi } from "@/services/api/notifications.api";
import { projectMembersApi } from "@/services/api/project-members.api";
import { Button } from "@/components/ui/button";
import { StatCard, Card, CardHeader, CardTitle, CardContent, EmptyState } from "@/components/ui/data-display";
import { Skeleton } from "@/components/ui/feedback";

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "activity">("overview");

  if (!id) {
    return (
      <div className="text-center py-10">
        <p className="text-xs text-destructive font-bold">Invalid Project ID parameters.</p>
      </div>
    );
  }

  // Queries
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => projectsApi.getDetail(id).then((res) => res.data),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "list", id],
    queryFn: () => tasksApi.list(id).then((res) => res.data),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list().then((res) => res.data),
  });

  const { data: membersResponse, isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: ["project-members", "list", id],
    queryFn: () => projectMembersApi.list(id).then((res) => res.data),
  });

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-8 text-center space-y-4">
        <p className="text-xs text-destructive font-semibold">Failed to load project details.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="h-8">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to projects
        </Button>
      </div>
    );
  }

  // Task filtering indicators
  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.status === "Done").length ?? 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header breadcrumb bar */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/projects")}
          className="h-8 text-[11px] font-semibold px-2 hover:bg-accent/40"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Projects List
        </Button>
      </div>

      {/* Project Details Panel */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {project.description || "No workspace description detail provided."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full select-none">
            Active
          </span>
        </div>
      </div>

      {/* KPI Cards metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          description="Tasks assigned inside project scope"
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasks}
          description="Resolved workflow cards"
        />
        <StatCard
          title="Project Progress"
          value={`${progressPercent}%`}
          description="Relative task completion speed"
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`h-9 px-4 text-xs font-bold transition-all focus:outline-none border-b-2 ${activeTab === "overview" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`h-9 px-4 text-xs font-bold transition-all focus:outline-none border-b-2 ${activeTab === "members" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`h-9 px-4 text-xs font-bold transition-all focus:outline-none border-b-2 ${activeTab === "activity" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Activity Log
        </button>
      </div>

      {/* Tab contexts */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tasks summary feed */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <CardTitle>Recent Tasks Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!tasks || tasks.length === 0 ? (
                  <EmptyState
                    title="No tasks found"
                    description="No tasks are currently mapped inside this project workspace."
                    icon={FileText}
                  />
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border border-border/40 bg-card/5 rounded-lg"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-foreground">{task.title}</span>
                          <span className="text-[10px] text-muted-foreground">Priority: {task.priority}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick stats sidebar */}
          <Card className="border border-border/80 bg-card/45 backdrop-blur self-start">
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/25 pb-2">
                <span className="text-muted-foreground">Workspace Status</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between border-b border-border/25 pb-2">
                <span className="text-muted-foreground">Total Backlog</span>
                <span className="font-bold text-foreground">
                  {tasks?.filter((t) => t.status === "Backlog").length ?? 0}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/25 pb-2">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-bold text-foreground">
                  {tasks?.filter((t) => t.status === "InProgress").length ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Review</span>
                <span className="font-bold text-foreground">
                  {tasks?.filter((t) => t.status === "InReview").length ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "members" && (
        <Card className="border border-border/80 bg-card/45 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <CardTitle>Team Members</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {membersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : membersError ? (
              <div className="text-center py-4 text-xs text-destructive font-semibold">
                Failed to load team members.
              </div>
            ) : !membersResponse || membersResponse.items.length === 0 ? (
              <EmptyState
                title="No members found"
                description="There are no members associated with this project workspace."
                icon={Users}
              />
            ) : (
              membersResponse.items.map((member) => {
                const name = member.user_name || "Workspace Member";
                const email = member.user_email || "No email provided";
                const roleLabel = member.role.toUpperCase();
                const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

                return (
                  <div key={member.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        {initials || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{name}</span>
                        <span className="text-[10px] text-muted-foreground">{email}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      member.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted border border-border text-muted-foreground"
                    }`}>
                      {roleLabel}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card className="border border-border/80 bg-card/45 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <CardTitle>Recent Project Activity Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No recent project timeline events.</p>
            ) : (
              <div className="relative pl-4 border-l border-border/60 space-y-5 py-2">
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="relative text-xs">
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
      )}
    </div>
  );
};
