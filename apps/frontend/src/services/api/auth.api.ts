import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";
import { TokenResponse, User } from "@/features/auth/auth-types";

export const authApi = {
  login(credentials: Record<string, string>, config?: RequestConfig): Promise<ApiResponse<TokenResponse>> {
    return apiClient.post<TokenResponse>(ENDPOINTS.AUTH.LOGIN, credentials, config);
  },

  register(payload: Record<string, string>, config?: RequestConfig): Promise<ApiResponse<User>> {
    return apiClient.post<User>(ENDPOINTS.AUTH.REGISTER, payload, config);
  },

  refreshToken(refreshToken: string, config?: RequestConfig): Promise<ApiResponse<TokenResponse>> {
    return apiClient.post<TokenResponse>(ENDPOINTS.AUTH.REFRESH, { refreshToken }, config);
  },

  logout(config?: RequestConfig): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT, undefined, config);
  },

  forgotPassword(email: string, config?: RequestConfig): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, config);
  },

  resetPassword(payload: Record<string, string>, config?: RequestConfig): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.RESET_PASSWORD, payload, config);
  },

  verifyEmail(token: string, config?: RequestConfig): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.VERIFY_EMAIL, { token }, config);
  },
};
