import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskComments } from "./TaskComments";
import { TaskAttachments } from "./TaskAttachments";
import { commentsApi } from "@/services/api/comments.api";
import { attachmentsApi } from "@/services/api/attachments.api";
import { usersApi } from "@/services/api/users.api";
import { projectMembersApi } from "@/services/api/project-members.api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/services/api/comments.api", () => ({
  commentsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/services/api/attachments.api", () => ({
  attachmentsApi: {
    list: vi.fn(),
    upload: vi.fn(),
    download: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/services/api/users.api", () => ({
  usersApi: {
    getMe: vi.fn(),
  },
}));

vi.mock("@/services/api/project-members.api", () => ({
  projectMembersApi: {
    list: vi.fn(),
  },
}));

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
      {ui}
    </QueryClientProvider>
  );
};

describe("TaskComments Component", () => {
  const mockUser = { id: "user-1", name: "Me", email: "me@example.com" };
  const mockComments = {
    items: [
      {
        id: "comm-1",
        task_id: "task-1",
        user_id: "user-1",
        content: "First test comment",
        created_at: "2026-07-29T10:00:00.000Z",
        updated_at: "2026-07-29T10:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    page_size: 20,
  };

  const mockMembers = {
    items: [
      {
        user_id: "user-1",
        user_name: "Member One",
        user_email: "member1@example.com",
      },
    ],
    total: 1,
    page: 1,
    page_size: 20,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(usersApi.getMe).mockResolvedValue({ data: mockUser, status: 200 } as any);
    vi.mocked(projectMembersApi.list).mockResolvedValue({ data: mockMembers, status: 200 } as any);
    vi.mocked(commentsApi.list).mockResolvedValue({ data: mockComments, status: 200 } as any);
  });

  it("should render comment items and profile details", async () => {
    renderWithClient(<TaskComments taskId="task-1" projectId="proj-1" />);

    expect(await screen.findByText("First test comment")).toBeInTheDocument();
    expect(screen.getByText("Member One")).toBeInTheDocument();
  });

  it("should trigger post comment mutation when form is submitted", async () => {
    vi.mocked(commentsApi.create).mockResolvedValue({
      data: {
        id: "comm-2",
        task_id: "task-1",
        user_id: "user-1",
        content: "A brand new comment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      status: 201,
    } as any);

    renderWithClient(<TaskComments taskId="task-1" projectId="proj-1" />);

    const input = await screen.findByPlaceholderText("Write a comment...");
    fireEvent.change(input, { target: { value: "A brand new comment" } });

    const submitBtn = screen.getByLabelText("Post comment");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(commentsApi.create).toHaveBeenCalledWith({
        task_id: "task-1",
        content: "A brand new comment",
      });
    });
  });
});

describe("TaskAttachments Component", () => {
  const mockAttachments = [
    {
      id: "attach-1",
      task_id: "task-1",
      uploaded_by: "user-1",
      filename: "screenshot.png",
      file_path: "/uploads/screenshot.png",
      mime_type: "image/png",
      file_size: 1024 * 50, // 50KB
      created_at: "2026-07-29T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(attachmentsApi.list).mockResolvedValue({ data: mockAttachments, status: 200 } as any);
  });

  it("should render list of attachment files", async () => {
    renderWithClient(<TaskAttachments taskId="task-1" />);

    expect(await screen.findByText("screenshot.png")).toBeInTheDocument();
    expect(screen.getByText("50 KB")).toBeInTheDocument();
  });

  it("should handle delete button actions", async () => {
    vi.mocked(attachmentsApi.delete).mockResolvedValue({ data: undefined, status: 204 } as any);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithClient(<TaskAttachments taskId="task-1" />);

    expect(await screen.findByText("screenshot.png")).toBeInTheDocument();
    const deleteBtn = screen.getByLabelText("Delete attachment");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(attachmentsApi.delete).toHaveBeenCalledWith("attach-1");
    });
  });
});
