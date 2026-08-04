import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";
import { User } from "@/features/auth/auth-types";

export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string | null;
  notification_preferences?: Record<string, boolean> | null;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const usersApi = {
  getMe(config?: RequestConfig): Promise<ApiResponse<User>> {
    return apiClient.get<User>(ENDPOINTS.USERS.ME, config);
  },

  updateProfile(payload: UpdateProfilePayload, config?: RequestConfig): Promise<ApiResponse<User>> {
    return apiClient.put<User>(ENDPOINTS.USERS.UPDATE_PROFILE, payload, config);
  },

  changePassword(payload: ChangePasswordPayload, config?: RequestConfig): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(ENDPOINTS.USERS.CHANGE_PASSWORD, payload, config);
  },

  listUsers(config?: RequestConfig): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(ENDPOINTS.USERS.LIST, config);
  },
};
