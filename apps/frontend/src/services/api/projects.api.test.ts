import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectsApi } from "./projects.api";
import { apiClient } from "./client";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("projectsApi", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should list projects correctly", async () => {
    const mockProjects = [
      { id: "1", name: "Project A", description: "Desc A" },
      { id: "2", name: "Project B", description: "Desc B" },
    ];
    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockProjects,
      status: 200,
    });

    const response = await projectsApi.list();

    expect(apiClient.get).toHaveBeenCalledWith("/projects", undefined);
    expect(response.data).toEqual(mockProjects);
  });

  it("should create project correctly", async () => {
    const newProject = { name: "New Project", description: "New Desc" };
    const mockCreated = { id: "3", ...newProject };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: mockCreated,
      status: 201,
    });

    const response = await projectsApi.create(newProject);

    expect(apiClient.post).toHaveBeenCalledWith("/projects", newProject, undefined);
    expect(response.data).toEqual(mockCreated);
  });
});
