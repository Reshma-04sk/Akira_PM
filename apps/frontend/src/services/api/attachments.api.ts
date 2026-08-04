import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Attachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  filename: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export const attachmentsApi = {
  list(taskId: string, config?: RequestConfig): Promise<ApiResponse<Attachment[]>> {
    return apiClient.get<Attachment[]>(ENDPOINTS.ATTACHMENTS.LIST(taskId), config);
  },

  upload(taskId: string, file: File, config?: RequestConfig): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("file", file);

    return apiClient.post<Attachment>(ENDPOINTS.ATTACHMENTS.UPLOAD, formData, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    });
  },

  download(id: string, config?: RequestConfig): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(ENDPOINTS.ATTACHMENTS.DOWNLOAD(id), {
      ...config,
      responseType: "blob" as any,
    });
  },

  delete(id: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.ATTACHMENTS.DELETE(id), config);
  },
};
