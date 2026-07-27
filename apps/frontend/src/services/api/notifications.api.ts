import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export const notificationsApi = {
  list(config?: RequestConfig): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST, config);
  },

  markRead(id: string, config?: RequestConfig): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), undefined, config);
  },

  markAllRead(config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, undefined, config);
  },
};
