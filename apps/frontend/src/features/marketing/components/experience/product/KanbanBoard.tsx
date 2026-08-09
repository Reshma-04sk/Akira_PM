import React, { useState, useEffect } from "react";
import KanbanCard from "./KanbanCard";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  progress?: number;
  assignee: string;
  tags?: string[];
  baseStatus: string;
}

interface KanbanBoardProps {
  isAddingTask: boolean;
  onAddTaskComplete: () => void;
}

const INITIAL_TASKS: TaskItem[] = [
  { id: "api-auth", title: "API Authentication Setup", description: "Implement JWT refresh token rotation.", priority: "HIGH", progress: 68, assignee: "AL", tags: ["Backend", "Security"], baseStatus: "BACKLOG" },
  { id: "redis", title: "Redis Caching Cluster", description: "Cluster caching layer setup.", priority: "MEDIUM", assignee: "SM", tags: ["Infrastructure"], baseStatus: "BACKLOG" },
  { id: "oauth", title: "OAuth Integration", description: "Implement Google OAuth callback flow.", priority: "HIGH", assignee: "AL", tags: ["Backend", "Auth"], baseStatus: "IN_PROGRESS" },
  { id: "dash", title: "Dashboard Analytics", description: "Build team velocity and burndown visualization.", priority: "LOW", assignee: "LT", tags: ["Frontend", "Analytics"], baseStatus: "IN_PROGRESS" },
  { id: "pg-mig", title: "PostgreSQL Migration", description: "Move production schema to PostgreSQL 18.", priority: "MEDIUM", assignee: "SM", tags: ["Database", "Infrastructure"], baseStatus: "REVIEW" },
  { id: "ci", title: "CI Pipeline Integration", description: "Validate pipelines integration workflow.", priority: "MEDIUM", assignee: "LT", tags: ["Infrastructure"], baseStatus: "DONE" },
  { id: "deploy", title: "Production Deployment", description: "Run automated blue-green environment updates.", priority: "HIGH", assignee: "AL", tags: ["Infrastructure"], baseStatus: "DONE" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ isAddingTask, onAddTaskComplete }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [animationStep, setAnimationStep] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    // Slow product demo timeline transitions (6 seconds loop intervals)
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const getTaskStatus = (task: TaskItem): string => {
    if (task.id === "oauth") {
      if (animationStep === 1 || animationStep === 2) return "REVIEW";
      return "IN_PROGRESS";
    }
    if (task.id === "pg-mig") {
      if (animationStep === 2) return "DONE";
      return "REVIEW";
    }
    return task.baseStatus;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Generated from dashboard",
      priority: "MEDIUM",
      assignee: "AL",
      tags: ["Pending"],
      baseStatus: "BACKLOG",
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDesc("");
    onAddTaskComplete();
  };

  const columns = ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"];
  const columnLabels = ["Backlog", "In Progress", "Review", "Done"];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4.5 bg-[#10141B] overflow-hidden flex-grow select-none">
      {columns.map((colKey, colIndex) => {
        const colTasks = tasks.filter((task) => getTaskStatus(task) === colKey);

        return (
          <div 
            key={colKey} 
            className={`${colIndex === 0 || colIndex === 2 ? "hidden md:flex" : "flex"} flex-col gap-3 h-full`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] tracking-wide text-gray-500 font-semibold uppercase">
                {columnLabels[colIndex]}
              </span>
              <div className="w-3.5 h-3.5 rounded-full bg-white/5 text-[8px] text-gray-600 flex items-center justify-center font-mono font-semibold">
                {colTasks.length + (colKey === "BACKLOG" && isAddingTask ? 1 : 0)}
              </div>
            </div>

            {/* Cards List container */}
            <div className="flex flex-col gap-2.5 flex-grow overflow-y-auto max-h-[480px] pr-0.5 scrollbar-none pb-4">
              {/* Inline Task Creator Form inside Backlog Column */}
              {colKey === "BACKLOG" && isAddingTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="border border-[#7c8cff]/30 bg-[#151A22] p-3 rounded-lg flex flex-col gap-2.5 shadow-md animate-in slide-in-from-top duration-300"
                >
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-semibold text-gray-200 placeholder-gray-600 font-sans"
                    autoFocus
                    required
                  />
                  <textarea
                    placeholder="Short description..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="bg-transparent border-none outline-none text-[9px] text-gray-500 placeholder-gray-700 font-sans resize-none h-10"
                  />
                  <div className="flex justify-end gap-1.5 pt-1.5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={onAddTaskComplete}
                      className="px-2 py-0.5 rounded text-[8px] text-gray-500 hover:text-white bg-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-0.5 rounded text-[8px] bg-[#7c8cff] hover:bg-[#6c7cfa] text-[#07090d] font-bold cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {colTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  progress={task.progress}
                  assignee={task.assignee}
                  tags={task.tags}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
