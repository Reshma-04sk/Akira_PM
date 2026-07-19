export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    field?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: str;
}

export interface RegisterPayload {
  email: string;
  password: str;
  full_name?: string;
}
