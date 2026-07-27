import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
}

export const commentsApi = {
  list(taskId: string, config?: RequestConfig): Promise<ApiResponse<Comment[]>> {
    return apiClient.get<Comment[]>(ENDPOINTS.COMMENTS.LIST(taskId), config);
  },

  create(taskId: string, payload: CreateCommentPayload, config?: RequestConfig): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(ENDPOINTS.COMMENTS.CREATE(taskId), payload, config);
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.COMMENTS.DELETE(id), config);
  },
};
