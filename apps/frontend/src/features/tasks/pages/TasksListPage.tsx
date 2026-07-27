import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Tag, 
  User, 
  FolderGit2, 
  ArrowRight,
  Filter,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { tasksApi, Task, TaskStatus, TaskPriority } from "@/services/api/tasks.api";
import { projectsApi } from "@/services/api/projects.api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/data-display";
import { Skeleton, toast } from "@/components/ui/feedback";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(100),
  description: z.string().max(1000, "Description must be under 1000 characters").optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Backlog", "Todo", "InProgress", "InReview", "Done"]),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  labels: z.string().optional().or(z.literal("")),
  estimatedTime: z.string().optional().or(z.literal("")),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export const TasksListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  // Modals & Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form hooks
  const createForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      projectId: "",
      assigneeId: "",
      dueDate: "",
      labels: "",
      estimatedTime: "",
    },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  // Queries
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  // Default to first project ID when loaded
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
      createForm.setValue("projectId", projects[0].id);
    }
  }, [projects, selectedProjectId, createForm]);

  const { data: tasks, isLoading: tasksLoading, error } = useQuery({
    queryKey: ["tasks", "list", selectedProjectId],
    queryFn: () => {
      if (!selectedProjectId) return Promise.resolve([]);
      return tasksApi.list(selectedProjectId).then((res) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: any }) =>
      tasksApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list", selectedProjectId] });
      toast.success("Task created", "Successfully added task to project workspace.");
      setIsCreateOpen(false);
      createForm.reset({
        title: "",
        description: "",
        priority: "Medium",
        status: "Todo",
        projectId: selectedProjectId,
        assigneeId: "",
        dueDate: "",
        labels: "",
        estimatedTime: "",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to create task", err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list", selectedProjectId] });
      toast.success("Task updated", "Task changes have been saved successfully.");
      setIsEditOpen(false);
      setIsDrawerOpen(false);
      setSelectedTask(null);
    },
    onError: (err: any) => {
      toast.error("Failed to update task", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list", selectedProjectId] });
      toast.success("Task deleted", "Task has been removed from workspace.");
      setIsDeleteOpen(false);
      setIsDrawerOpen(false);
      setSelectedTask(null);
    },
    onError: (err: any) => {
      toast.error("Failed to delete task", err.message);
    },
  });

  // Submissions
  const onCreateSubmit = (data: TaskFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee_id: data.assigneeId || null,
      due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    createMutation.mutate({ projectId: data.projectId, payload });
  };

  const onEditSubmit = (data: TaskFormValues) => {
    if (!selectedTask) return;
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee_id: data.assigneeId || null,
      due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    updateMutation.mutate({ id: selectedTask.id, payload });
  };

  const openDrawer = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const openEditDialog = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      projectId: selectedProjectId,
      assigneeId: task.assignee_id || "",
      dueDate: task.due_date || "",
      labels: "",
      estimatedTime: "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  // Filter & Sort Tasks locally
  const filteredTasks = (tasks || [])
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return a.priority.localeCompare(b.priority);
    });

  const showLoading = projectsLoading || tasksLoading;

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Tasks Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse tasks, adjust priority boards, assign roles, and log progress reports.
          </p>
        </div>
        <Button
          size="sm"
          disabled={!projects || projects.length === 0}
          onClick={() => {
            createForm.setValue("projectId", selectedProjectId);
            setIsCreateOpen(true);
          }}
          className="h-8 gap-1.5 px-3 text-[11px] font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4">
        {/* Project Selector dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <FolderGit2 className="h-4 w-4 shrink-0 text-primary" />
            <span>Active Project:</span>
          </div>
          <Select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 text-[11px] w-64 max-w-full font-bold"
            options={(projects || []).map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>

        {/* Filters and Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-[11px] bg-background/50"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-[11px]"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Backlog", label: "Backlog" },
                { value: "Todo", label: "To Do" },
                { value: "InProgress", label: "In Progress" },
                { value: "InReview", label: "In Review" },
                { value: "Done", label: "Done" },
              ]}
            />

            {/* Priority Filter */}
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 text-[11px]"
              options={[
                { value: "all", label: "All Priorities" },
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Urgent", label: "Urgent" },
              ]}
            />
          </div>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 text-[11px] self-end sm:self-auto"
            options={[
              { value: "title", label: "Sort by Title" },
              { value: "priority", label: "Sort by Priority" },
            ]}
          />
        </div>
      </div>

      {/* Main List Layout */}
      {showLoading ? (
        <div className="border border-border/60 rounded-xl p-4 bg-card/10 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-border/25 last:border-0">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 text-center text-xs text-destructive font-semibold">
          Failed to load tasks. Please verify your selected project settings.
        </div>
      ) : !selectedProjectId ? (
        <EmptyState
          title="No projects configured"
          description="Create a project workspace before managing task cards."
          icon={CheckSquare}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Tasks registered inside this project workspace will display in the list below."
          icon={CheckSquare}
          action={
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-[11px] font-semibold">
              Add New Task
            </Button>
          }
        />
      ) : (
        /* TABLE LIST VIEW */
        <div className="border border-border/80 bg-card/40 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-3">Task Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25 bg-card/10">
                {filteredTasks.map((task) => (
                  <tr 
                    key={task.id}
                    onClick={() => openDrawer(task)}
                    className="hover:bg-accent/15 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-foreground max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === "Urgent" ? "bg-red-500/10 text-red-600" :
                        task.priority === "High" ? "bg-amber-500/10 text-amber-600" :
                        "bg-blue-500/10 text-blue-600"
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "--"}
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => openEditDialog(task, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => openDeleteDialog(task, e)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* dialog overlays */}

      {/* Task Details Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Task Overview Details">
        {selectedTask && (
          <div className="space-y-6 text-xs leading-relaxed">
            {/* Title segment */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">{selectedTask.title}</h3>
              <p className="text-[10px] text-muted-foreground">Task Identifier: {selectedTask.id}</p>
            </div>

            {/* Params attributes list */}
            <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4 bg-muted/15 rounded-lg px-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Priority</span>
                <p className="font-bold text-foreground">{selectedTask.priority}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Workflow Status</span>
                <p className="font-bold text-foreground">{selectedTask.status}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Due Date</span>
                <p className="font-bold text-foreground">
                  {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : "--"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Estimated Duration</span>
                <p className="font-bold text-foreground">4 hrs</p>
              </div>
            </div>

            {/* Description segment */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground font-semibold">Description Details</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {selectedTask.description || "No description provided for this task workspace card."}
              </p>
            </div>

            {/* Stats references */}
            <div className="border-t border-border/40 pt-4 grid grid-cols-3 gap-2 text-center text-muted-foreground text-[10px]">
              <div className="border border-border/60 bg-card p-2 rounded">
                <MessageSquare className="h-4.5 w-4.5 mx-auto mb-1 text-primary shrink-0" />
                <span>0 Comments</span>
              </div>
              <div className="border border-border/60 bg-card p-2 rounded">
                <Paperclip className="h-4.5 w-4.5 mx-auto mb-1 text-primary shrink-0" />
                <span>0 Files</span>
              </div>
              <div className="border border-border/60 bg-card p-2 rounded">
                <Clock className="h-4.5 w-4.5 mx-auto mb-1 text-primary shrink-0" />
                <span>0 Subtasks</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/40 justify-end">
              <Button variant="outline" size="sm" onClick={(e) => openEditDialog(selectedTask, e as any)} className="h-8">
                <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Task
              </Button>
              <Button variant="destructive" size="sm" onClick={(e) => openDeleteDialog(selectedTask, e as any)} className="h-8">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Task
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Task Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <FormField error={createForm.formState.errors.title?.message}>
            <FormLabel required>Task Title</FormLabel>
            <Input 
              placeholder="E.g., Implement OAuth API endpoints"
              disabled={createMutation.isPending}
              {...createForm.register("title")}
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
            <FormField error={createForm.formState.errors.priority?.message}>
              <FormLabel required>Priority</FormLabel>
              <Select 
                disabled={createMutation.isPending}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                  { value: "Urgent", label: "Urgent" },
                ]}
                {...createForm.register("priority")}
              />
            </FormField>

            <FormField error={createForm.formState.errors.status?.message}>
              <FormLabel required>Status</FormLabel>
              <Select 
                disabled={createMutation.isPending}
                options={[
                  { value: "Backlog", label: "Backlog" },
                  { value: "Todo", label: "To Do" },
                  { value: "InProgress", label: "In Progress" },
                  { value: "InReview", label: "In Review" },
                  { value: "Done", label: "Done" },
                ]}
                {...createForm.register("status")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField error={createForm.formState.errors.dueDate?.message}>
              <FormLabel>Due Date</FormLabel>
              <Input 
                type="date"
                disabled={createMutation.isPending}
                {...createForm.register("dueDate")}
              />
            </FormField>

            <FormField error={createForm.formState.errors.estimatedTime?.message}>
              <FormLabel>Estimated Hours</FormLabel>
              <Input 
                type="number"
                placeholder="E.g., 4"
                disabled={createMutation.isPending}
                {...createForm.register("estimatedTime")}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task Details">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <FormField error={editForm.formState.errors.title?.message}>
            <FormLabel required>Task Title</FormLabel>
            <Input 
              placeholder="E.g., Implement OAuth API endpoints"
              disabled={updateMutation.isPending}
              {...editForm.register("title")}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField error={editForm.formState.errors.priority?.message}>
              <FormLabel required>Priority</FormLabel>
              <Select 
                disabled={updateMutation.isPending}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                  { value: "Urgent", label: "Urgent" },
                ]}
                {...editForm.register("priority")}
              />
            </FormField>

            <FormField error={editForm.formState.errors.status?.message}>
              <FormLabel required>Status</FormLabel>
              <Select 
                disabled={updateMutation.isPending}
                options={[
                  { value: "Backlog", label: "Backlog" },
                  { value: "Todo", label: "To Do" },
                  { value: "InProgress", label: "In Progress" },
                  { value: "InReview", label: "In Review" },
                  { value: "Done", label: "Done" },
                ]}
                {...editForm.register("status")}
              />
            </FormField>
          </div>

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
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Task Card">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you absolutely sure you want to delete <span className="font-bold text-foreground">"{selectedTask?.title}"</span>? 
            This task card will be permanently erased from this project workspace. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => {
              if (selectedTask) deleteMutation.mutate(selectedTask.id);
            }} isLoading={deleteMutation.isPending}>
              Delete Task
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
