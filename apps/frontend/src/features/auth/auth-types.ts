export type UserRole = "Owner" | "Manager" | "Developer" | "Viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  notification_preferences?: Record<string, boolean> | null;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  createdAt?: string;
}

export type AuthStatus = "Loading" | "Authenticated" | "Unauthenticated" | "Refreshing" | "Expired";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}
