import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  fileSize: number;
  contentType: string;
  url: string;
  uploadedById: string;
  createdAt: string;
}

export const attachmentsApi = {
  list(taskId: string, config?: RequestConfig): Promise<ApiResponse<Attachment[]>> {
    return apiClient.get<Attachment[]>(ENDPOINTS.ATTACHMENTS.LIST(taskId), config);
  },

  upload(taskId: string, file: File, config?: RequestConfig): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append("file", file);

    // Axios client detects FormData and correctly injects multi-part content headers
    return apiClient.post<Attachment>(ENDPOINTS.ATTACHMENTS.UPLOAD(taskId), formData, {
      ...config,
    });
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.ATTACHMENTS.DELETE(id), config);
  },
};
