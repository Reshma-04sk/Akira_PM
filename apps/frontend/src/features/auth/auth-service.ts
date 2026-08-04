import { api } from "@/lib/axios";
import { User, TokenResponse } from "./auth-types";
import { authStorage } from "./auth-storage";

export const authService = {
  async login(credentials: Record<string, string>): Promise<TokenResponse> {
    // Formats request as standard URL encoded form data or JSON based on backend config
    const response = await api.post<any>("/auth/login", credentials);
    const data = response.data;
    return {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
      expiresIn: data.expiresIn || data.expires_in,
    };
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // Allow silent logout failure
    } finally {
      authStorage.clearTokens();
    }
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<any>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    const data = response.data;
    return {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
      expiresIn: data.expiresIn || data.expires_in,
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<any>("/users/me");
    const data = response.data;
    return {
      ...data,
      name: data.name || data.full_name || "",
    };
  },

  isAuthenticated(): boolean {
    return !!authStorage.getAccessToken();
  },
};
