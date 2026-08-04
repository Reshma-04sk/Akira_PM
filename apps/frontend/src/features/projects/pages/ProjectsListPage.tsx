import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  FolderGit2, 
  Search, 
  Grid, 
  List, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Users
} from "lucide-react";
import { projectsApi, Project } from "@/services/api/projects.api";
import { dashboardApi } from "@/services/api/dashboard.api";
import { projectMembersApi } from "@/services/api/project-members.api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@/components/ui/data-display";
import { Skeleton, toast, Progress } from "@/components/ui/feedback";

// Colors schema selection
const PROJECT_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500, "Description must be under 500 characters").optional().or(z.literal("")),
  status: z.string().default("Active"),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  color: z.string().min(1, "Please select a label color"),
  icon: z.string().optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectGridCard: React.FC<{
  project: Project;
  onEdit: (project: Project, e: React.MouseEvent) => void;
  onDelete: (project: Project, e: React.MouseEvent) => void;
}> = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["projects", "stats", project.id],
    queryFn: () => dashboardApi.getProjectStats(project.id).then((res) => res.data),
    staleTime: 30000,
  });

  const { data: membersResponse, isLoading: membersLoading } = useQuery({
    queryKey: ["project-members", "list", project.id],
    queryFn: () => projectMembersApi.list(project.id).then((res) => res.data),
    staleTime: 30000,
  });

  const totalTasks = stats?.tasks_count ?? 0;
  const completedTasks = stats?.completed_tasks ?? 0;
  const progressVal = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const membersCount = membersResponse?.length ?? 0;

  const showLoading = statsLoading || membersLoading;

  return (
    <Card 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="border border-border/80 bg-card/40 hover:bg-card/75 transition-all hover:border-primary/40 cursor-pointer flex flex-col justify-between group"
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={(e) => onEdit(project, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => onDelete(project, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[11px] text-muted-foreground line-clamp-2 h-8">
          {project.description || "No project description provided."}
        </p>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
            <span>Task Progress</span>
            <span className="font-bold text-foreground">
              {showLoading ? "..." : `${progressVal}%`}
            </span>
          </div>
          <Progress value={showLoading ? 0 : progressVal} className="h-1" />
        </div>

        {/* Meta details */}
        <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {showLoading ? "..." : `${totalTasks} tasks`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" />
              {showLoading ? "..." : `${membersCount} members`}
            </span>
          </div>
          <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectListRow: React.FC<{
  project: Project;
  onEdit: (project: Project, e: React.MouseEvent) => void;
  onDelete: (project: Project, e: React.MouseEvent) => void;
}> = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["projects", "stats", project.id],
    queryFn: () => dashboardApi.getProjectStats(project.id).then((res) => res.data),
    staleTime: 30000,
  });

  const totalTasks = stats?.tasks_count ?? 0;
  const showLoading = statsLoading;

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/10 transition-colors cursor-pointer group gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate max-w-xs sm:max-w-md">
            {project.description || "No project description."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground self-end sm:self-auto">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" />
          {showLoading ? "..." : `${totalTasks} tasks`}
        </span>
        <span className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          Active
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <Button variant="ghost" size="sm" onClick={(e) => onEdit(project, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => onDelete(project, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProjectsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  // Layout & Filters State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Queries
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const projects: Project[] = Array.isArray(projectsData) 
    ? projectsData 
    : ((projectsData as any)?.items ? (projectsData as any).items : []);

  // React Hook Form for creation
  const createForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
      startDate: "",
      dueDate: "",
      color: "#3b82f6",
      icon: "",
    },
  });

  // React Hook Form for editing
  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      toast.success("Project created", "The project workspace has been created.");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (err: any) => {
      toast.error("Failed to create project", err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      projectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      toast.success("Project updated", "Your workspace changes have been saved.");
      setIsEditOpen(false);
      setSelectedProject(null);
    },
    onError: (err: any) => {
      toast.error("Failed to update project", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
      toast.success("Project deleted", "The project workspace has been deleted.");
      setIsDeleteOpen(false);
      setSelectedProject(null);
    },
    onError: (err: any) => {
      toast.error("Failed to delete project", err.message);
    },
  });

  // Form Submissions
  const onCreateSubmit = (data: ProjectFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: ProjectFormValues) => {
    if (!selectedProject) return;
    updateMutation.mutate({ id: selectedProject.id, payload: data });
  };

  const openEditDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    editForm.reset({
      name: project.name,
      description: project.description || "",
      status: "Active",
      color: "#3b82f6",
      startDate: "",
      dueDate: "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  // Filter & Sort Projects
  const filteredProjects = (projects || [])
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (project.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return b.created_at.localeCompare(a.created_at);
    });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Workspace Projects</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage projects, timelines, status reports, and collaborate with your team.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-8 gap-1.5 px-3 text-[11px] font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-[11px] bg-background/50"
            />
          </div>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 text-[11px]"
            options={[
              { value: "name", label: "Sort by Name" },
              { value: "date", label: "Sort by Date Created" },
            ]}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-border/60 bg-muted/30 rounded-lg p-0.5 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-7 px-2.5 text-[11px] ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <Grid className="h-3.5 w-3.5 mr-1" />
            Grid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-7 px-2.5 text-[11px] ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <List className="h-3.5 w-3.5 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Grid / List Main Feed */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="p-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2 w-full mt-2" />
              <div className="flex justify-between items-center mt-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 text-center text-xs text-destructive font-semibold">
          Failed to load workspace projects. Please check your connectivity.
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try modifying your search queries or create a new project workspace."
          icon={FolderGit2}
          action={
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-[11px] font-semibold">
              Create Project
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectGridCard 
              key={project.id} 
              project={project}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/40 bg-card/10">
          {filteredProjects.map((project) => (
            <ProjectListRow 
              key={project.id}
              project={project}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* dialog overlays */}

      {/* Create Project Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <FormField error={createForm.formState.errors.name?.message}>
            <FormLabel required>Project Name</FormLabel>
            <Input 
              placeholder="E.g., Client Portal Integration"
              disabled={createMutation.isPending}
              {...createForm.register("name")}
            />
          </FormField>

          <FormField error={createForm.formState.errors.description?.message}>
            <FormLabel>Description</FormLabel>
            <Textarea 
              placeholder="Describe targets, context, criteria..."
              disabled={createMutation.isPending}
              {...createForm.register("description")}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField error={createForm.formState.errors.startDate?.message}>
              <FormLabel>Start Date</FormLabel>
              <Input 
                type="date"
                disabled={createMutation.isPending}
                {...createForm.register("startDate")}
              />
            </FormField>

            <FormField error={createForm.formState.errors.dueDate?.message}>
              <FormLabel>Due Date</FormLabel>
              <Input 
                type="date"
                disabled={createMutation.isPending}
                {...createForm.register("dueDate")}
              />
            </FormField>
          </div>

          <FormField error={createForm.formState.errors.color?.message}>
            <FormLabel required>Label Theme Color</FormLabel>
            <Select 
              disabled={createMutation.isPending}
              options={PROJECT_COLORS}
              {...createForm.register("color")}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project Details">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <FormField error={editForm.formState.errors.name?.message}>
            <FormLabel required>Project Name</FormLabel>
            <Input 
              placeholder="E.g., Client Portal Integration"
              disabled={updateMutation.isPending}
              {...editForm.register("name")}
            />
          </FormField>

          <FormField error={editForm.formState.errors.description?.message}>
            <FormLabel>Description</FormLabel>
            <Textarea 
              placeholder="Describe targets, context, criteria..."
              disabled={updateMutation.isPending}
              {...editForm.register("description")}
            />
          </FormField>

          <FormField error={editForm.formState.errors.color?.message}>
            <FormLabel required>Label Theme Color</FormLabel>
            <Select 
              disabled={updateMutation.isPending}
              options={PROJECT_COLORS}
              {...editForm.register("color")}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Project Workspace">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you absolutely sure you want to delete <span className="font-bold text-foreground">"{selectedProject?.name}"</span>? 
            This action will remove the workspace and all items associated with it. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => {
              if (selectedProject) deleteMutation.mutate(selectedProject.id);
            }} isLoading={deleteMutation.isPending}>
              Delete Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
