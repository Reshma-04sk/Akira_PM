import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckSquare, 
  Search, 
  AlertCircle, 
  User, 
  FolderGit2, 
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tasksApi, Task, TaskStatus, TaskPriority } from "@/services/api/tasks.api";
import { projectsApi, Project } from "@/services/api/projects.api";
import { projectMembersApi, ProjectMember } from "@/services/api/project-members.api";
import { TaskComments } from "../components/TaskComments";
import { TaskAttachments } from "../components/TaskAttachments";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { EmptyState, Avatar } from "@/components/ui/data-display";
import { Skeleton, toast } from "@/components/ui/feedback";

// Form validation schema with Zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Task title is required").max(100, "Title must be under 100 characters"),
  description: z.string().max(1000, "Description must be under 1000 characters").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  assigneeId: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export const TasksListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // View Mode: list or board
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Bulk Selection State
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Dialog / Drawer States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Load task and project from query params if specified
  useEffect(() => {
    const urlProjectId = searchParams.get("project_id");
    const urlTaskId = searchParams.get("task_id");

    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
    }
    if (urlTaskId && (!selectedTask || selectedTask.id !== urlTaskId)) {
      tasksApi.getDetail(urlTaskId)
        .then((res) => {
          setSelectedTask(res.data);
          setIsDrawerOpen(true);
        })
        .catch((err) => {
          console.error("Failed to load task from query parameters:", err);
        });
    }
  }, [searchParams, selectedProjectId, selectedTask]);

  // Forms Hook Setup
  const createForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assigneeId: "",
      dueDate: "",
    },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
  });

  // Populate Edit Form when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      editForm.reset({
        title: selectedTask.title,
        description: selectedTask.description || "",
        priority: selectedTask.priority,
        status: selectedTask.status,
        assigneeId: selectedTask.assignee_id || "",
        dueDate: selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "",
      });
    }
  }, [selectedTask, editForm]);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [selectedProjectId, searchQuery, statusFilter, priorityFilter, assigneeFilter, pageSize]);

  // Reset selection on project change
  useEffect(() => {
    setSelectedTaskIds(new Set());
  }, [selectedProjectId]);

  // Queries - Projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const projects: Project[] = Array.isArray(projectsData) 
    ? projectsData 
    : ((projectsData as any)?.items ? (projectsData as any).items : []);

  // Default to first project ID
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Queries - Project Members (for Assignees list)
  const { data: membersResponse } = useQuery({
    queryKey: ["project-members", "list", selectedProjectId],
    queryFn: () => {
      if (!selectedProjectId) {
        return Promise.resolve({ items: [], total: 0, page: 1, page_size: 100 } as any);
      }
      return projectMembersApi.list(selectedProjectId).then((res) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  const members: ProjectMember[] = Array.isArray(membersResponse)
    ? membersResponse
    : ((membersResponse as any)?.items ? (membersResponse as any).items : []);

  // Queries - Tasks (paginated)
  const { data: tasksResponse, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: [
      "tasks", 
      "list", 
      { 
        projectId: selectedProjectId, 
        assigneeId: assigneeFilter === "all" ? undefined : assigneeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        search: searchQuery || undefined,
        page, 
        pageSize 
      }
    ],
    queryFn: () => {
      if (!selectedProjectId) {
        return Promise.resolve({ items: [], total: 0, page: 1, page_size: pageSize });
      }
      return tasksApi.list({
        project_id: selectedProjectId,
        assignee_id: assigneeFilter === "all" ? null : assigneeFilter,
        status: statusFilter === "all" ? null : statusFilter,
        priority: priorityFilter === "all" ? null : priorityFilter,
        search: searchQuery || null,
        page,
        page_size: pageSize,
      }).then((res) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  // Local sorting of matching tasks page
  const sortedTasks = React.useMemo(() => {
    if (!tasksResponse?.items) return [];
    return [...tasksResponse.items].sort((a, b) => {
      let valA: any = a[sortBy as keyof Task];
      let valB: any = b[sortBy as keyof Task];

      if (sortBy === "project") {
        valA = a.project?.name || "";
        valB = b.project?.name || "";
      } else if (sortBy === "assignee") {
        valA = a.assignee?.full_name || a.assignee?.email || "";
        valB = b.assignee?.full_name || b.assignee?.email || "";
      } else if (sortBy === "creator") {
        valA = a.creator?.full_name || "";
        valB = b.creator?.full_name || "";
      }

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [tasksResponse?.items, sortBy, sortOrder]);

  // Helper to handle multi-query optimistic updates
  const applyOptimisticUpdate = async (updater: (oldData: any) => any) => {
    await queryClient.cancelQueries({ queryKey: ["tasks", "list"] });
    const previousQueries = queryClient.getQueriesData({ queryKey: ["tasks", "list"] });

    previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
      if (!oldData) return;
      queryClient.setQueryData(queryKey, updater(oldData));
    });

    return { previousQueries };
  };

  // Helper to rollback queries on error
  const rollbackOptimisticUpdate = (context: any) => {
    if (context?.previousQueries) {
      context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    }
  };

  const invalidateTaskData = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };

  // Mutations - Create Task
  const createMutation = useMutation({
    mutationFn: (payload: any) => tasksApi.create(selectedProjectId, payload),
    onMutate: async (newPayload) => {
      const tempId = `temp-${Date.now()}`;
      const matchedMember = members.find(m => m.user_id === newPayload.assignee_id);
      
      const tempTask: Task = {
        id: tempId,
        project_id: selectedProjectId,
        title: newPayload.title,
        description: newPayload.description || null,
        status: newPayload.status as TaskStatus,
        priority: newPayload.priority as TaskPriority,
        assignee_id: newPayload.assignee_id || null,
        due_date: newPayload.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project: projects?.find(p => p.id === selectedProjectId) ? { id: selectedProjectId, name: projects.find(p => p.id === selectedProjectId)!.name } : undefined,
        assignee: matchedMember 
          ? { id: newPayload.assignee_id, full_name: matchedMember.user_name || null, email: matchedMember.user_email || "", avatar_url: null }
          : null,
        creator: { id: "current-user", full_name: "Me" },
      };

      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: [tempTask, ...oldData.items],
        total: oldData.total + 1,
      }));
    },
    onError: (err, _newPayload, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to create task", err.message);
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Update Task
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => tasksApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      const matchedMember = members.find(m => m.user_id === payload.assignee_id);

      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.map((item: Task) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...payload };
          if (payload.assignee_id !== undefined) {
            updated.assignee = matchedMember 
              ? { id: payload.assignee_id, full_name: matchedMember.user_name || null, email: matchedMember.user_email || "", avatar_url: null }
              : null;
          }
          return updated;
        }),
      }));
    },
    onError: (err, _vars, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to update task", err.message);
    },
    onSuccess: () => {
      toast.success("Task updated successfully");
      setIsEditOpen(false);
      setIsDrawerOpen(false);
      setSelectedTask(null);
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Move Task (Kanban Drag & Drop)
  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.moveTask(id, status),
    onMutate: async ({ id, status }) => {
      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.map((item: Task) =>
          item.id === id ? { ...item, status } : item
        ),
      }));
    },
    onError: (err, _vars, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to move task", err.message);
    },
    onSuccess: () => {
      toast.success("Task status updated");
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Delete Task
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onMutate: async (id) => {
      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.filter((item: Task) => item.id !== id),
        total: Math.max(0, oldData.total - 1),
      }));
    },
    onError: (err, _id, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to delete task", err.message);
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      setIsDeleteOpen(false);
      setIsDrawerOpen(false);
      setSelectedTask(null);
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Bulk Status Update
  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TaskStatus }) =>
      Promise.all(ids.map(id => tasksApi.update(id, { status }))),
    onMutate: async ({ ids, status }) => {
      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.map((item: Task) => 
          ids.includes(item.id) ? { ...item, status } : item
        ),
      }));
    },
    onError: (err, _vars, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to update task statuses", err.message);
    },
    onSuccess: () => {
      toast.success("Statuses updated successfully");
      setSelectedTaskIds(new Set());
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Bulk Priority Update
  const bulkPriorityMutation = useMutation({
    mutationFn: ({ ids, priority }: { ids: string[]; priority: TaskPriority }) =>
      Promise.all(ids.map(id => tasksApi.update(id, { priority }))),
    onMutate: async ({ ids, priority }) => {
      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.map((item: Task) => 
          ids.includes(item.id) ? { ...item, priority } : item
        ),
      }));
    },
    onError: (err, _vars, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to update task priorities", err.message);
    },
    onSuccess: () => {
      toast.success("Priorities updated successfully");
      setSelectedTaskIds(new Set());
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Mutations - Bulk Delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => tasksApi.delete(id))),
    onMutate: async (ids) => {
      return applyOptimisticUpdate((oldData) => ({
        ...oldData,
        items: oldData.items.filter((item: Task) => !ids.includes(item.id)),
        total: Math.max(0, oldData.total - ids.length),
      }));
    },
    onError: (err, _ids, context) => {
      rollbackOptimisticUpdate(context);
      toast.error("Failed to delete tasks", err.message);
    },
    onSuccess: () => {
      toast.success("Tasks deleted successfully");
      setSelectedTaskIds(new Set());
      setIsDeleteOpen(false);
      setSelectedTask(null);
    },
    onSettled: () => {
      invalidateTaskData();
    },
  });

  // Submissions
  const onCreateSubmit = (values: TaskFormValues) => {
    createMutation.mutate({
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      assignee_id: values.assigneeId || null,
      due_date: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    });
  };

  const onEditSubmit = (values: TaskFormValues) => {
    if (!selectedTask) return;
    updateMutation.mutate({
      id: selectedTask.id,
      payload: {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        assignee_id: values.assigneeId || null,
        due_date: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    } else {
      bulkDeleteMutation.mutate(Array.from(selectedTaskIds));
    }
  };

  // Sort helpers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 shrink-0" />;
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary shrink-0" />
      : <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary shrink-0" />;
  };

  // Helpers
  const showLoading = projectsLoading || tasksLoading;
  const total = tasksResponse?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMockCardMeta = (id: string) => {
    const charSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const commentsCount = (charSum % 3) + 1;
    const attachmentsCount = charSum % 2;
    
    const tagsList = ["API", "Frontend", "DB", "Design", "QA", "Refactor", "Security"];
    const tag1 = tagsList[charSum % tagsList.length];
    const tag2 = tagsList[(charSum + 2) % tagsList.length];
    const tags = charSum % 2 === 0 ? [tag1] : [tag1, tag2];
    
    return { commentsCount, attachmentsCount, tags };
  };

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...(members || []).map((m) => ({
      value: m.user_id,
      label: m.user_name || m.user_email || m.user_id,
    })),
  ];

  const assigneeFilterOptions = [
    { value: "all", label: "All Assignees" },
    ...(members || []).map((m) => ({
      value: m.user_id,
      label: m.user_name || m.user_email || m.user_id,
    })),
  ];

  // Group columns by status for Kanban Board
  const columns: { status: TaskStatus; label: string }[] = [
    { status: "todo", label: "To Do" },
    { status: "in_progress", label: "In Progress" },
    { status: "in_review", label: "In Review" },
    { status: "done", label: "Done" },
  ];

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Tasks Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse and query task logs, apply search criteria, and track team status.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View switcher */}
          <div className="flex border border-border bg-muted/30 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all focus:outline-none ${viewMode === "list" ? "bg-background text-foreground shadow-sm animate-in fade-in duration-100" : "text-muted-foreground hover:text-foreground"}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all focus:outline-none ${viewMode === "board" ? "bg-background text-foreground shadow-sm animate-in fade-in duration-100" : "text-muted-foreground hover:text-foreground"}`}
            >
              Board View
            </button>
          </div>

          <Button
            size="sm"
            disabled={!selectedProjectId}
            onClick={() => {
              createForm.reset({
                title: "",
                description: "",
                priority: "medium",
                status: "todo",
                assigneeId: "",
                dueDate: "",
              });
              setIsCreateOpen(true);
            }}
            className="h-8 gap-1.5 px-3 text-[11px] font-semibold"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4">
        {/* Project Selector */}
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

        {/* Filters, Search row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full md:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-[11px] bg-background/50"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-[11px] w-full md:w-36"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "in_review", label: "In Review" },
                { value: "done", label: "Done" },
              ]}
            />

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 text-[11px] w-full md:w-36"
              options={[
                { value: "all", label: "All Priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />

            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-8 text-[11px] w-full md:w-44"
              options={assigneeFilterOptions}
            />
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <span className="text-[10px] text-muted-foreground font-semibold">Sort:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 text-[11px] w-32"
              options={[
                { value: "title", label: "Title" },
                { value: "status", label: "Status" },
                { value: "priority", label: "Priority" },
                { value: "due_date", label: "Due Date" },
                { value: "created_at", label: "Created At" },
              ]}
            />
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="h-8 text-[11px] w-24"
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedTaskIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-primary">
              {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  bulkStatusMutation.mutate({
                    ids: Array.from(selectedTaskIds),
                    status: e.target.value as TaskStatus,
                  });
                }
              }}
              className="h-8 text-[11px] w-full sm:w-36 bg-background"
              options={[
                { value: "", label: "Change Status..." },
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "in_review", label: "In Review" },
                { value: "done", label: "Done" },
              ]}
            />
            <Select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  bulkPriorityMutation.mutate({
                    ids: Array.from(selectedTaskIds),
                    priority: e.target.value as TaskPriority,
                  });
                }
              }}
              className="h-8 text-[11px] w-full sm:w-36 bg-background"
              options={[
                { value: "", label: "Change Priority..." },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedTask(null);
                setIsDeleteOpen(true);
              }}
              className="h-8 text-[11px] font-bold w-full sm:w-auto gap-1"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTaskIds(new Set())}
              className="h-8 text-[11px] font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main List/Board Layout */}
      {showLoading ? (
        <div className="border border-border/60 rounded-xl p-4 bg-card/10 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40 font-semibold text-muted-foreground text-xs">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b border-border/20 last:border-0">
              <Skeleton className="h-4 w-60" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : tasksError ? (
        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 text-center text-xs text-destructive font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          Failed to load tasks. Please verify your selected project settings.
        </div>
      ) : !selectedProjectId ? (
        <EmptyState
          title="No projects configured"
          description="Create a project workspace before managing task cards."
          icon={CheckSquare}
        />
      ) : sortedTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Tasks registered inside this project workspace matching criteria will display here."
          icon={CheckSquare}
        />
      ) : viewMode === "board" ? (
        /* KANBAN BOARD VIEW */
        <div className="flex overflow-x-auto gap-4 pb-4 select-none scrollbar-thin animate-in fade-in duration-200">
          {columns.map((col) => {
            const colTasks = sortedTasks.filter((t) => t.status === col.status);
            const isHovered = draggedOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId) {
                    moveTaskMutation.mutate({ id: taskId, status: col.status });
                  }
                  setDraggedOverColumn(null);
                }}
                onDragEnter={() => setDraggedOverColumn(col.status)}
                onDragLeave={() => setDraggedOverColumn(null)}
                className={cn(
                  "flex flex-col rounded-2xl p-4 w-72 min-w-[290px] shrink-0 transition-all duration-200 min-h-[500px]",
                  isHovered 
                    ? "border border-[#d4af37]/35 bg-[#d4af37]/5 shadow-[0_0_20px_rgba(212,175,55,0.08)]" 
                    : "border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md"
                )}
                aria-label={`Column ${col.label}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
                  <h3 className="font-extrabold text-[10px] tracking-[0.12em] uppercase text-foreground">{col.label}</h3>
                  <span className="text-[9px] font-black text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-0.5 rounded-full select-none">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards Stack */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-6 min-h-[140px] text-center bg-[#070707]/30">
                      <span className="text-[10px] font-medium text-muted-foreground/60 italic">No tasks in stage</span>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const { commentsCount, attachmentsCount, tags } = getMockCardMeta(task.id);
                      const assigneeInitials = task.assignee?.full_name
                        ? task.assignee.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        : task.assignee?.email?.slice(0, 2).toUpperCase() || "U";

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedTask(task);
                            setIsDrawerOpen(true);
                          }}
                          className="group relative flex flex-col gap-3.5 p-4 rounded-xl border border-white/5 bg-[#0d0d0d]/80 hover:bg-[#121212]/90 hover:border-[#d4af37]/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.06)] cursor-grab active:cursor-grabbing transition-all duration-200"
                          draggable={true}
                          onDragStart={(e: any) => {
                            e.dataTransfer.setData("text/plain", task.id);
                          }}
                          aria-label={`Task card ${task.title}`}
                        >
                          {/* Left Glow Active Indicator Accent */}
                          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Checkbox & Title */}
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.has(task.id)}
                              onChange={() => {
                                const newSet = new Set(selectedTaskIds);
                                if (newSet.has(task.id)) {
                                  newSet.delete(task.id);
                                } else {
                                  newSet.add(task.id);
                                }
                                setSelectedTaskIds(newSet);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-white/10 bg-black cursor-pointer mt-0.5 accent-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                              aria-label={`Select task ${task.title}`}
                            />
                            <h4 className="font-bold text-xs leading-relaxed text-foreground group-hover:text-[#d4af37] transition-colors flex-1 select-none">
                              {task.title}
                            </h4>
                          </div>

                          {/* Tag badges */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map((tag, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground/90 uppercase tracking-wider"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Middle row: Priority, Due Date */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px]">
                            <span className={cn(
                              "font-black text-[9px] uppercase px-2 py-0.5 rounded border tracking-wider",
                              task.priority === "critical" ? "bg-rose-950/30 text-rose-400 border-rose-900/30" :
                              task.priority === "high" ? "bg-amber-950/20 text-amber-400 border-amber-900/20" :
                              task.priority === "medium" ? "bg-blue-950/20 text-blue-400 border-blue-900/20" :
                              "bg-zinc-900/30 text-zinc-400 border-zinc-800/30"
                            )}>
                              {task.priority}
                            </span>
                            
                            {task.due_date && (
                              <span className="text-muted-foreground/80 flex items-center gap-1 shrink-0 font-medium text-[9px]">
                                <Calendar className="h-3 w-3 text-[#d4af37]/80" />
                                {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>

                          {/* Footer row: Assignee, Comments/Attachments */}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-white/5 pt-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar
                                fallback={assigneeInitials}
                                src={task.assignee?.avatar_url || undefined}
                                className="h-5 w-5 text-[8px] border border-white/10 bg-gradient-to-br from-[#ab8836]/20 to-[#f5d061]/20 text-[#d4af37]"
                              />
                              <span className="truncate text-[10px] font-semibold text-foreground">
                                {task.assignee ? task.assignee.full_name || task.assignee.email.split("@")[0] : "Unassigned"}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-muted-foreground/60 shrink-0">
                              <span className="flex items-center gap-1 hover:text-white transition-colors">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {commentsCount}
                              </span>
                              {attachmentsCount > 0 && (
                                <span className="flex items-center gap-1 hover:text-white transition-colors">
                                  <Paperclip className="h-3.5 w-3.5" />
                                  {attachmentsCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="border border-border/80 bg-card/40 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground font-semibold select-none">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={sortedTasks.length > 0 && sortedTasks.every(t => selectedTaskIds.has(t.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTaskIds(new Set(sortedTasks.map(t => t.id)));
                          } else {
                            setSelectedTaskIds(new Set());
                          }
                        }}
                        className="rounded border-border bg-background cursor-pointer"
                        aria-label="Select all tasks"
                      />
                    </th>
                    <th onClick={() => handleSort("title")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Task Title
                        {renderSortIcon("title")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("status")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Status
                        {renderSortIcon("status")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("priority")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Priority
                        {renderSortIcon("priority")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("assignee")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Assignee
                        {renderSortIcon("assignee")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("creator")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Creator
                        {renderSortIcon("creator")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("due_date")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        Due Date
                        {renderSortIcon("due_date")}
                      </div>
                    </th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25 bg-card/10">
                  {sortedTasks.map((task) => (
                    <tr 
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-accent/10 transition-colors cursor-pointer"
                    >
                      <td className="p-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.has(task.id)}
                          onChange={() => {
                            const newSet = new Set(selectedTaskIds);
                            if (newSet.has(task.id)) {
                              newSet.delete(task.id);
                            } else {
                              newSet.add(task.id);
                            }
                            setSelectedTaskIds(newSet);
                          }}
                          className="rounded border-border bg-background cursor-pointer"
                          aria-label={`Select task ${task.title}`}
                        />
                      </td>
                      <td className="p-3 font-bold text-foreground max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          task.status === "done" ? "bg-emerald-500/10 text-emerald-600" :
                          task.status === "in_progress" ? "bg-primary/10 text-primary" :
                          task.status === "in_review" ? "bg-purple-500/10 text-purple-600" :
                          "bg-zinc-500/10 text-zinc-500"
                        }`}>
                          {task.status === "in_progress" ? "In Progress" :
                           task.status === "in_review" ? "In Review" :
                           task.status === "todo" ? "To Do" :
                           task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          task.priority === "critical" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                          task.priority === "high" ? "bg-amber-500/10 text-amber-600" :
                          task.priority === "medium" ? "bg-blue-500/10 text-blue-600" :
                          "bg-zinc-500/10 text-zinc-500"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {task.assignee ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{task.assignee.full_name || task.assignee.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {task.creator?.full_name || "System"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDate(task.due_date)}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsEditOpen(true);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            aria-label="Edit task"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDeleteOpen(true);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            aria-label="Delete task"
                          >
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/25 border border-border/40 rounded-xl p-3 text-xs select-none">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>
                Showing <span className="font-bold text-foreground">{Math.min((page - 1) * pageSize + 1, total)}</span> to{" "}
                <span className="font-bold text-foreground">{Math.min(page * pageSize, total)}</span> of{" "}
                <span className="font-bold text-foreground">{total}</span> tasks
              </span>
              <div className="flex items-center gap-1.5">
                <span>Page size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-7 border border-border bg-background rounded px-1.5 text-xs font-semibold cursor-pointer focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK DIALOG */}
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
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "critical", label: "Critical" },
                ]}
                {...createForm.register("priority")}
              />
            </FormField>

            <FormField error={createForm.formState.errors.status?.message}>
              <FormLabel required>Status</FormLabel>
              <Select 
                disabled={createMutation.isPending}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review", label: "In Review" },
                  { value: "done", label: "Done" },
                ]}
                {...createForm.register("status")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField error={createForm.formState.errors.assigneeId?.message}>
              <FormLabel>Assignee</FormLabel>
              <Select 
                disabled={createMutation.isPending}
                options={assigneeOptions}
                {...createForm.register("assigneeId")}
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

      {/* EDIT TASK DIALOG */}
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
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "critical", label: "Critical" },
                ]}
                {...editForm.register("priority")}
              />
            </FormField>

            <FormField error={editForm.formState.errors.status?.message}>
              <FormLabel required>Status</FormLabel>
              <Select 
                disabled={updateMutation.isPending}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review", label: "In Review" },
                  { value: "done", label: "Done" },
                ]}
                {...editForm.register("status")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField error={editForm.formState.errors.assigneeId?.message}>
              <FormLabel>Assignee</FormLabel>
              <Select 
                disabled={updateMutation.isPending}
                options={assigneeOptions}
                {...editForm.register("assigneeId")}
              />
            </FormField>

            <FormField error={editForm.formState.errors.dueDate?.message}>
              <FormLabel>Due Date</FormLabel>
              <Input 
                type="date"
                disabled={updateMutation.isPending}
                {...editForm.register("dueDate")}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title={selectedTask ? "Delete Task Card" : "Bulk Delete Tasks"}
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {selectedTask ? (
              <>
                Are you absolutely sure you want to delete <span className="font-bold text-foreground">"{selectedTask.title}"</span>? 
                This task card will be permanently erased. This action cannot be undone.
              </>
            ) : (
              <>
                Are you absolutely sure you want to delete all <span className="font-bold text-foreground">{selectedTaskIds.size}</span> selected tasks? 
                This action is destructive and cannot be undone.
              </>
            )}
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DETAILS DRAWER */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          if (searchParams.has("task_id")) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete("task_id");
            setSearchParams(nextParams);
          }
        }} 
        title="Task Overview Details"
      >
        {selectedTask && (
          <div className="space-y-6 text-xs leading-relaxed animate-in slide-in-from-right-4 duration-200">
            <div>
              <h3 className="text-sm font-bold text-foreground">{selectedTask.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">ID: {selectedTask.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4 bg-muted/15 rounded-lg px-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Priority</span>
                <p className="font-bold text-foreground capitalize">{selectedTask.priority}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Workflow Status</span>
                <p className="font-bold text-foreground capitalize">
                  {selectedTask.status === "in_progress" ? "In Progress" :
                   selectedTask.status === "in_review" ? "In Review" :
                   selectedTask.status === "todo" ? "To Do" :
                   selectedTask.status}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Due Date</span>
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {formatDate(selectedTask.due_date)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Assignee</span>
                <p className="font-bold text-foreground">
                  {selectedTask.assignee ? selectedTask.assignee.full_name || selectedTask.assignee.email : "Unassigned"}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Created By</span>
                <p className="font-bold text-foreground">
                  {selectedTask.creator ? selectedTask.creator.full_name : "System"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground font-semibold">Description</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-line bg-card border border-border/60 p-3 rounded-lg min-h-[60px]">
                {selectedTask.description || "No description provided for this task card."}
              </p>
            </div>

            {/* Attachments Section */}
            <div className="border-t border-border/40 pt-4">
              <TaskAttachments taskId={selectedTask.id} />
            </div>

            {/* Comments Section */}
            <div className="border-t border-border/40 pt-4">
              <TaskComments taskId={selectedTask.id} projectId={selectedTask.project_id} />
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/40 justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditOpen(true)} 
                className="h-8 gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Task
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsDeleteOpen(true)} 
                className="h-8 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Task
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
