import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Edit3, 
  Trash2,
  Plus
} from "lucide-react";
import { tasksApi, Task, TaskStatus, TaskPriority, TaskListResponse } from "@/services/api/tasks.api";
import { projectsApi, Project } from "@/services/api/projects.api";
import { projectMembersApi, ProjectMember } from "@/services/api/project-members.api";
import { Card, CardContent } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/selection";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { Skeleton, toast } from "@/components/ui/feedback";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { TaskComments } from "@/features/tasks/components/TaskComments";
import { TaskAttachments } from "@/features/tasks/components/TaskAttachments";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Drawer / Dialog states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Queries - Projects list
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsApi.list().then((res) => res.data),
  });

  const projects: Project[] = Array.isArray(projectsData) 
    ? projectsData 
    : ((projectsData as any)?.items ? (projectsData as any).items : []);

  // Handle setting default project ID
  React.useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Queries - Project members (for assignees options)
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

  // Queries - Tasks list (up to 100 for visual calendar)
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "list", { projectId: selectedProjectId, pageSize: 100 }],
    queryFn: () => {
      if (!selectedProjectId) {
        return Promise.resolve({ items: [], total: 0, page: 1, page_size: 100 } as TaskListResponse);
      }
      return tasksApi.list({
        project_id: selectedProjectId,
        page_size: 100,
      }).then((res) => res.data);
    },
    enabled: !!selectedProjectId,
  });

  const tasks: Task[] = Array.isArray(tasksResponse)
    ? tasksResponse
    : (tasksResponse as any)?.items || [];

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      tasksApi.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      toast.success("Task updated", "Task changes saved successfully.");
      if (selectedTask && selectedTask.id === res.data.id) {
        setSelectedTask(res.data);
      }
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      toast.error("Failed to update task", err.message || "An error occurred.");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      toast.success("Task deleted", "Task card has been removed.");
      setIsDrawerOpen(false);
      setSelectedTask(null);
    },
    onError: (err: any) => {
      toast.error("Failed to delete task", err.message || "An error occurred.");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: any) => tasksApi.create(selectedProjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      toast.success("Task created", "Successfully created new task.");
      setIsCreateOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskStatus("todo");
      setTaskPriority("medium");
      setTaskAssignee("");
      setTaskDueDate("");
    },
    onError: (err: any) => {
      toast.error("Failed to create task", err.message || "An error occurred.");
    },
  });

  // Date Navigation
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "month") {
      nextDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewMode === "week") {
      nextDate.setDate(currentDate.getDate() - 7);
    } else {
      nextDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "month") {
      nextDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewMode === "week") {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    updateTaskMutation.mutate({
      id: taskId,
      payload: { due_date: targetDateStr },
    });
  };

  // Date Helpers
  const formatDateString = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getMonthName = (d: Date): string => {
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Grid Generators
  const getMonthDays = (): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay(); // days to show from prev month

    const startGridDate = new Date(year, month, 1 - startOffset);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startGridDate);
      d.setDate(startGridDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getWeekDays = (): Date[] => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // UI Handlers
  const handleOpenEdit = () => {
    if (!selectedTask) return;
    setTaskTitle(selectedTask.title);
    setTaskDesc(selectedTask.description || "");
    setTaskStatus(selectedTask.status);
    setTaskPriority(selectedTask.priority);
    setTaskAssignee(selectedTask.assignee_id || "");
    setTaskDueDate(selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskTitle.trim()) return;
    updateTaskMutation.mutate({
      id: selectedTask.id,
      payload: {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        assignee_id: taskAssignee || null,
        due_date: taskDueDate || null,
      },
    });
  };

  const handleCreateOpenOnDate = (dateStr: string) => {
    setTaskTitle("");
    setTaskDesc("");
    setTaskStatus("todo");
    setTaskPriority("medium");
    setTaskAssignee("");
    setTaskDueDate(dateStr);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProjectId) return;
    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
      assignee_id: taskAssignee || null,
      due_date: taskDueDate || null,
    });
  };

  // Options lists
  const assigneeOptions = (members || []).map((m: any) => ({
    value: m.user_id,
    label: m.user_name || m.user_email || m.user_id,
  }));

  const projectOptions = (projects || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const showLoader = projectsLoading || tasksLoading;

  return (
    <div className="space-y-6 select-none animate-in fade-in-30 duration-200">
      {/* Calendar Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/45 border border-border/80 backdrop-blur rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-52">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={projectOptions}
              disabled={projectsLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-bold tracking-tight w-46 text-center text-foreground">
              {viewMode === "month" && getMonthName(currentDate)}
              {viewMode === "week" && `Week of ${currentDate.toLocaleDateString("default", { month: "short", day: "numeric" })}`}
              {viewMode === "day" && currentDate.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNext} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-[11px] font-semibold px-2.5">
              Today
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            size="sm"
            variant={viewMode === "month" ? "primary" : "outline"}
            onClick={() => setViewMode("month")}
            className="h-8 text-[10px] font-bold px-3"
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={viewMode === "week" ? "primary" : "outline"}
            onClick={() => setViewMode("week")}
            className="h-8 text-[10px] font-bold px-3"
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={viewMode === "day" ? "primary" : "outline"}
            onClick={() => setViewMode("day")}
            className="h-8 text-[10px] font-bold px-3"
          >
            Day
          </Button>
        </div>
      </div>

      {showLoader ? (
        <Card className="min-h-[450px] p-6 flex flex-col gap-4">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-full w-full flex-grow min-h-[350px]" />
        </Card>
      ) : (
        <Card className="border border-border/80 bg-card/45 backdrop-blur overflow-hidden">
          <CardContent className="p-0">
            {/* MONTH VIEW */}
            {viewMode === "month" && (
              <div className="flex flex-col">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-border/50 text-center py-2 text-[10px] font-bold text-muted-foreground bg-muted/10 uppercase tracking-wider">
                  {WEEKDAYS.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                {/* Dates grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-border/40 border-t border-l border-border/40">
                  {getMonthDays().map((date: Date, idx: number) => {
                    const dateStr = formatDateString(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = formatDateString(new Date()) === dateStr;

                    const dayTasks = tasks.filter((t: Task) => {
                      if (!t.due_date) return false;
                      return t.due_date.split("T")[0] === dateStr;
                    });

                    return (
                      <div
                        key={idx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dateStr)}
                        className={`min-h-[100px] p-2 flex flex-col gap-1 transition-all ${
                          isCurrentMonth ? "bg-card/20" : "bg-muted/5 opacity-40"
                        } hover:bg-accent/5 relative group`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                              isToday
                                ? "bg-primary text-primary-foreground font-extrabold shadow-sm"
                                : "text-muted-foreground"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          <button
                            onClick={() => handleCreateOpenOnDate(dateStr)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer hover:shadow-sm"
                            title="Add Task to Date"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[72px] pr-0.5">
                          {dayTasks.map((task: Task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setIsDrawerOpen(true);
                              }}
                              className={`text-[9px] font-bold p-1 rounded border shadow-sm transition-all leading-tight cursor-grab active:cursor-grabbing hover:-translate-y-0.5 select-none ${
                                task.status === "done"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 line-through"
                                  : task.priority === "critical"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : task.priority === "high"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-card hover:bg-accent border-border/80 text-foreground"
                              }`}
                            >
                              <div className="truncate">{task.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === "week" && (
              <div className="grid grid-cols-7 divide-x divide-border/40 border-l border-border/40 min-h-[400px]">
                {getWeekDays().map((date: Date, idx: number) => {
                  const dateStr = formatDateString(date);
                  const isToday = formatDateString(new Date()) === dateStr;

                  const dayTasks = tasks.filter((t: Task) => {
                    if (!t.due_date) return false;
                    return t.due_date.split("T")[0] === dateStr;
                  });

                  return (
                    <div
                      key={idx}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dateStr)}
                      className="flex flex-col p-3 hover:bg-accent/5 transition-all group min-h-[350px]"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {WEEKDAYS[date.getDay()]}
                          </span>
                          <span
                            className={`text-sm font-extrabold mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                              isToday ? "bg-primary text-primary-foreground font-black" : "text-foreground"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCreateOpenOnDate(dateStr)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Add Task"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                        {dayTasks.map((task: Task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDrawerOpen(true);
                            }}
                            className={`text-[10px] font-bold p-2.5 rounded-lg border shadow-sm transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5 ${
                              task.status === "done"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 line-through"
                                : task.priority === "critical"
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : task.priority === "high"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-card border-border/80 hover:bg-accent/40 text-foreground"
                            }`}
                          >
                            <div className="font-extrabold text-foreground truncate">{task.title}</div>
                            {task.description && (
                              <p className="text-[9px] text-muted-foreground truncate mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/20">
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                                {task.status}
                              </span>
                              {task.assignee && (
                                <span className="text-[8px] font-semibold text-muted-foreground truncate max-w-[50px]">
                                  {task.assignee.full_name || task.assignee.email}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === "day" && (
              <div className="p-4 sm:p-6 min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Tasks due on {currentDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {
                          tasks.filter((t: Task) => t.due_date && t.due_date.split("T")[0] === formatDateString(currentDate)).length
                        }{" "}
                        tasks scheduled
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateOpenOnDate(formatDateString(currentDate))}
                    className="h-8 gap-1 px-3 text-[10px] font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Task
                  </Button>
                </div>

                <div className="flex-1 flex flex-col gap-2.5">
                  {tasks
                    .filter((t: Task) => t.due_date && t.due_date.split("T")[0] === formatDateString(currentDate))
                    .map((task: Task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDrawerOpen(true);
                        }}
                        className="flex items-center justify-between p-3 border border-border/60 hover:border-border bg-card/25 hover:bg-accent/15 rounded-xl transition-all cursor-pointer"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-extrabold text-foreground leading-none">{task.title}</span>
                          <span className="text-[9px] text-muted-foreground line-clamp-1">
                            {task.description || "No description provided."}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[8px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              task.priority === "critical"
                                ? "bg-destructive/10 text-destructive"
                                : task.priority === "high"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t: Task) => t.due_date && t.due_date.split("T")[0] === formatDateString(currentDate)).length === 0 && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 py-16 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground/45 mb-2" />
                      <p className="text-xs font-semibold">No tasks scheduled for this day.</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Enjoy a clear calendar!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE TASK DIALOG */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField>
            <FormLabel required>Task Title</FormLabel>
            <Input
              placeholder="E.g., Implement OAuth API endpoints"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={createTaskMutation.isPending}
              required
            />
          </FormField>

          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe targets, criteria..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              disabled={createTaskMutation.isPending}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Priority</FormLabel>
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

            <FormField>
              <FormLabel required>Status</FormLabel>
              <Select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                disabled={createTaskMutation.isPending}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review", label: "In Review" },
                  { value: "done", label: "Done" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel>Assignee</FormLabel>
              <Select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                disabled={createTaskMutation.isPending}
                options={[{ value: "", label: "Unassigned" }, ...assigneeOptions]}
              />
            </FormField>

            <FormField>
              <FormLabel>Due Date</FormLabel>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                disabled={createTaskMutation.isPending}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField>
            <FormLabel required>Task Title</FormLabel>
            <Input
              placeholder="E.g., Implement OAuth API endpoints"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={updateTaskMutation.isPending}
              required
            />
          </FormField>

          <FormField>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe targets, criteria..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              disabled={updateTaskMutation.isPending}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>Priority</FormLabel>
              <Select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                disabled={updateTaskMutation.isPending}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "critical", label: "Critical" },
                ]}
              />
            </FormField>

            <FormField>
              <FormLabel required>Status</FormLabel>
              <Select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                disabled={updateTaskMutation.isPending}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review", label: "In Review" },
                  { value: "done", label: "Done" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel>Assignee</FormLabel>
              <Select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                disabled={updateTaskMutation.isPending}
                options={[{ value: "", label: "Unassigned" }, ...assigneeOptions]}
              />
            </FormField>

            <FormField>
              <FormLabel>Due Date</FormLabel>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                disabled={updateTaskMutation.isPending}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={updateTaskMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DETAILS DRAWER */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
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
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "No due date"}
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
                onClick={handleOpenEdit}
                className="h-8 gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Task
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTaskMutation.mutate(selectedTask.id)}
                isLoading={deleteTaskMutation.isPending}
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
export default CalendarPage;
