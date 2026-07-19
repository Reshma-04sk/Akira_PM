import { api } from "./api";
import { APIResponse, LoginPayload, RegisterPayload, TokenResponse, User } from "@/types/auth";

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const response = await api.post<APIResponse<User>>("/auth/register", payload);
    return response.data.data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const response = await api.post<APIResponse<TokenResponse>>("/auth/login", payload);
    return response.data.data;
  },

  async me(): Promise<User> {
    const response = await api.get<APIResponse<User>>("/auth/me");
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refresh_token: refreshToken });
  },
};
