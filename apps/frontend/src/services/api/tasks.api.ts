import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export type TaskStatus = "Backlog" | "Todo" | "InProgress" | "InReview" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id?: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
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

export const tasksApi = {
  list(projectId: string, config?: RequestConfig): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(ENDPOINTS.TASKS.LIST(projectId), config);
  },

  create(projectId: string, payload: CreateTaskPayload, config?: RequestConfig): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(ENDPOINTS.TASKS.CREATE(projectId), payload, config);
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
