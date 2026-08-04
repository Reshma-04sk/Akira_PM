import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateCommentPayload {
  task_id: string;
  content: string;
}

export const commentsApi = {
  async list(taskId: string, config?: RequestConfig): Promise<ApiResponse<Comment[]>> {
    const res = await apiClient.get<any>(ENDPOINTS.COMMENTS.LIST(taskId), config);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
    };
  },

  create(payload: CreateCommentPayload, config?: RequestConfig): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(ENDPOINTS.COMMENTS.CREATE, payload, config);
  },

  update(id: string, payload: { content: string }, config?: RequestConfig): Promise<ApiResponse<Comment>> {
    return apiClient.patch<Comment>(ENDPOINTS.COMMENTS.UPDATE(id), payload, config);
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.COMMENTS.DELETE(id), config);
  },
};
