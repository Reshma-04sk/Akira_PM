import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  page_size: number;
}

export const notificationsApi = {
  async list(config?: RequestConfig): Promise<ApiResponse<Notification[]>> {
    const res = await apiClient.get<any>(ENDPOINTS.NOTIFICATIONS.LIST, config);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : (res.data?.items ?? []),
    };
  },

  listPaginated(config?: RequestConfig): Promise<ApiResponse<NotificationListResponse>> {
    return apiClient.get<NotificationListResponse>(ENDPOINTS.NOTIFICATIONS.LIST, config);
  },

  markRead(id: string, config?: RequestConfig): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), undefined, config);
  },

  markAllRead(config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, undefined, config);
  },
};
