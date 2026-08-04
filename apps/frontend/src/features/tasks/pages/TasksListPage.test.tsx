import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TasksListPage } from "./TasksListPage";
import { projectsApi } from "@/services/api/projects.api";
import { projectMembersApi } from "@/services/api/project-members.api";
import { tasksApi } from "@/services/api/tasks.api";

vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
  },
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock("@/services/api/projects.api", () => ({
  projectsApi: {
    list: vi.fn(),
  },
}));

vi.mock("@/services/api/project-members.api", () => ({
  projectMembersApi: {
    list: vi.fn(),
  },
}));

vi.mock("@/services/api/tasks.api", () => ({
  tasksApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { MemoryRouter } from "react-router-dom";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("TasksListPage", () => {
  const mockProjects = [{ id: "proj-1", name: "Project 1", description: "", owner_id: "user-1", created_at: "", updated_at: "" }];
  
  const mockMembers = [
    {
      id: "mem-1",
      project_id: "proj-1",
      user_id: "user-1",
      invited_by: null,
      role: "owner" as const,
      created_at: "",
      updated_at: "",
      user_name: "Member 1",
      user_email: "member1@example.com",
    },
  ];

  const mockTasks = {
    items: [
      {
        id: "task-1",
        project_id: "proj-1",
        title: "Task 1",
        description: "Task 1 description",
        status: "todo" as const,
        priority: "medium" as const,
        assignee_id: "user-1",
        due_date: null,
        created_at: "2026-07-29T10:00:00.000Z",
        updated_at: "2026-07-29T10:00:00.000Z",
        project: { id: "proj-1", name: "Project 1" },
        assignee: { id: "user-1", full_name: "Member 1", email: "member1@example.com", avatar_url: null },
        creator: { id: "user-2", full_name: "Creator User" },
      },
    ],
    total: 1,
    page: 1,
    page_size: 10,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    vi.mocked(projectsApi.list).mockResolvedValue({
      data: mockProjects,
      status: 200,
    });
    
    vi.mocked(projectMembersApi.list).mockResolvedValue({
      data: mockMembers,
      status: 200,
    });

    vi.mocked(tasksApi.list).mockResolvedValue({
      data: mockTasks,
      status: 200,
    });
  });

  it("should render tasks list, filters, sorting and pagination controls", async () => {
    renderWithClient(<TasksListPage />);

    // Check title rendering
    expect(await screen.findByText("Tasks Management")).toBeInTheDocument();
    
    // Check project selector rendering
    expect(screen.getByText("Active Project:")).toBeInTheDocument();

    // Check filters inputs
    expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument();

    // Check task rendering in table
    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(screen.getAllByText("Member 1")[0]).toBeInTheDocument();
    expect(screen.getByText("Creator User")).toBeInTheDocument();

    // Check pagination rendering
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
  });

  it("should open create task dialog on button click", async () => {
    renderWithClient(<TasksListPage />);

    const createBtn = await screen.findByRole("button", { name: /Create Task/i });
    await waitFor(() => expect(createBtn).not.toBeDisabled());
    fireEvent.click(createBtn);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create New Task" })).toBeInTheDocument();
  });

  it("should select tasks and render bulk actions toolbar", async () => {
    renderWithClient(<TasksListPage />);

    // Wait for the task to render first
    expect(await screen.findByText("Task 1")).toBeInTheDocument();

    const checkbox = screen.getByLabelText("Select task Task 1");
    fireEvent.click(checkbox);

    expect(await screen.findByText("1 task selected")).toBeInTheDocument();
    expect(screen.getByText("Delete Selected")).toBeInTheDocument();
  });

  it("should switch to Kanban Board view and render columns", async () => {
    renderWithClient(<TasksListPage />);

    const boardBtn = await screen.findByRole("button", { name: /Board View/i });
    fireEvent.click(boardBtn);

    // Verify status columns render
    expect(await screen.findByRole("heading", { name: /To Do/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /In Progress/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /In Review/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Done/i })).toBeInTheDocument();

    // Verify task is displayed in the correct column
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });
});
