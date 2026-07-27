import { api } from "@/lib/axios";
import { User, TokenResponse } from "./auth-types";
import { authStorage } from "./auth-storage";

export const authService = {
  async login(credentials: Record<string, string>): Promise<TokenResponse> {
    // Formats request as standard URL encoded form data or JSON based on backend config
    const response = await api.post<TokenResponse>("/auth/login", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Allow silent logout failure
    } finally {
      authStorage.clearTokens();
    }
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!authStorage.getAccessToken();
  },
};
