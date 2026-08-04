import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export type ProjectRole = "owner" | "manager" | "developer" | "viewer";

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  invited_by: string | null;
  role: ProjectRole;
  created_at: string;
  updated_at: string;
  user_email?: string | null;
  user_name?: string | null;
}

export interface ProjectMemberListResponse {
  items: ProjectMember[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProjectMemberCreatePayload {
  user_id: string;
  role: ProjectRole;
}

export interface ProjectMemberUpdatePayload {
  role: ProjectRole;
}

export const projectMembersApi = {
  async list(projectId: string, config?: RequestConfig): Promise<ApiResponse<ProjectMember[]>> {
    const res = await apiClient.get<any>(ENDPOINTS.PROJECT_MEMBERS.LIST(projectId), config);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
    };
  },

  add(projectId: string, payload: ProjectMemberCreatePayload, config?: RequestConfig): Promise<ApiResponse<ProjectMember>> {
    return apiClient.post<ProjectMember>(ENDPOINTS.PROJECT_MEMBERS.ADD(projectId), payload, config);
  },

  updateRole(userId: string, projectId: string, payload: ProjectMemberUpdatePayload, config?: RequestConfig): Promise<ApiResponse<ProjectMember>> {
    return apiClient.patch<ProjectMember>(ENDPOINTS.PROJECT_MEMBERS.UPDATE(userId, projectId), payload, config);
  },

  delete(userId: string, projectId: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.PROJECT_MEMBERS.DELETE(userId, projectId), config);
  },
};
