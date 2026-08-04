import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id?: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  creator: {
    id: string;
    full_name: string | null;
  };
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}

export interface TaskListParams {
  project_id: string;
  assignee_id?: string | null;
  status?: string | null;
  priority?: string | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface TasksApi {
  list(projectId: string, config?: RequestConfig): Promise<ApiResponse<Task[]>>;
  list(params: TaskListParams, config?: RequestConfig): Promise<ApiResponse<TaskListResponse>>;
  create(projectId: string, payload: CreateTaskPayload, config?: RequestConfig): Promise<ApiResponse<Task>>;
  getDetail(id: string, config?: RequestConfig): Promise<ApiResponse<Task>>;
  update(id: string, payload: UpdateTaskPayload, config?: RequestConfig): Promise<ApiResponse<Task>>;
  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>>;
  moveTask(id: string, status: TaskStatus, config?: RequestConfig): Promise<ApiResponse<Task>>;
}

export const tasksApi: TasksApi = {
  async list(
    projectOrParams: string | TaskListParams,
    config?: RequestConfig
  ): Promise<any> {
    if (typeof projectOrParams === "string") {
      const res = await apiClient.get<any>(`/tasks?project_id=${projectOrParams}`, config);
      return {
        ...res,
        data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
      };
    }
    const queryParams = new URLSearchParams();
    Object.entries(projectOrParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, String(val));
      }
    });
    const res = await apiClient.get<any>(`/tasks?${queryParams.toString()}`, config);
    const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    const total = typeof res.data === "object" && res.data !== null && "total" in res.data 
      ? res.data.total 
      : items.length;
    return {
      ...res,
      data: {
        items,
        total,
        page: res.data?.page ?? 1,
        page_size: res.data?.page_size ?? 20,
      },
    };
  },

  create(projectId: string, payload: CreateTaskPayload, config?: RequestConfig): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>("/tasks", { ...payload, project_id: projectId }, config);
  },

  getDetail(id: string, config?: RequestConfig): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(ENDPOINTS.TASKS.DETAIL(id), config);
  },

  update(id: string, payload: UpdateTaskPayload, config?: RequestConfig): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(ENDPOINTS.TASKS.UPDATE(id), payload, config);
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.TASKS.DELETE(id), config);
  },

  moveTask(id: string, status: TaskStatus, config?: RequestConfig): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(ENDPOINTS.TASKS.DRAG_DROP(id), { status }, config);
  },
};
