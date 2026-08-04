import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  joined_at: string;
}

export interface WorkspaceListResponse {
  items: Workspace[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: string;
}

export const workspacesApi = {
  async list(config?: RequestConfig): Promise<ApiResponse<Workspace[]>> {
    const res = await apiClient.get<any>(ENDPOINTS.WORKSPACES.LIST, config);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
    };
  },

  create(payload: CreateWorkspacePayload, config?: RequestConfig): Promise<ApiResponse<Workspace>> {
    return apiClient.post<Workspace>(ENDPOINTS.WORKSPACES.CREATE, payload, config);
  },

  update(id: string, payload: UpdateWorkspacePayload, config?: RequestConfig): Promise<ApiResponse<Workspace>> {
    return apiClient.patch<Workspace>(ENDPOINTS.WORKSPACES.UPDATE(id), payload, config);
  },

  getMembers(id: string, config?: RequestConfig): Promise<ApiResponse<WorkspaceMember[]>> {
    return apiClient.get<WorkspaceMember[]>(ENDPOINTS.WORKSPACES.MEMBERS(id), config);
  },

  inviteMember(id: string, payload: InviteMemberPayload, config?: RequestConfig): Promise<ApiResponse<WorkspaceMember>> {
    return apiClient.post<WorkspaceMember>(ENDPOINTS.WORKSPACES.INVITE(id), payload, config);
  },

  updateMemberRole(id: string, userId: string, payload: { role: string }, config?: RequestConfig): Promise<ApiResponse<WorkspaceMember>> {
    return apiClient.patch<WorkspaceMember>(ENDPOINTS.WORKSPACES.UPDATE_MEMBER(id, userId), payload, config);
  },

  removeMember(id: string, userId: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.WORKSPACES.REMOVE_MEMBER(id, userId), config);
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.WORKSPACES.DETAIL(id), config);
  },
};
