import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export const projectsApi = {
  async list(config?: RequestConfig): Promise<ApiResponse<Project[]>> {
    const res = await apiClient.get<any>(ENDPOINTS.PROJECTS.LIST, config);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
    };
  },

  create(payload: CreateProjectPayload, config?: RequestConfig): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(ENDPOINTS.PROJECTS.CREATE, payload, config);
  },

  getDetail(id: string, config?: RequestConfig): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(ENDPOINTS.PROJECTS.DETAIL(id), config);
  },

  update(id: string, payload: UpdateProjectPayload, config?: RequestConfig): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(ENDPOINTS.PROJECTS.UPDATE(id), payload, config);
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.PROJECTS.DELETE(id), config);
  },
};
