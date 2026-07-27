import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";
import { User } from "@/features/auth/auth-types";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}

export const usersApi = {
  getMe(config?: RequestConfig): Promise<ApiResponse<User>> {
    return apiClient.get<User>(ENDPOINTS.USERS.ME, config);
  },

  updateProfile(payload: UpdateProfilePayload, config?: RequestConfig): Promise<ApiResponse<User>> {
    return apiClient.put<User>(ENDPOINTS.USERS.UPDATE_PROFILE, payload, config);
  },

  listUsers(config?: RequestConfig): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(ENDPOINTS.USERS.LIST, config);
  },
};
