export type UserRole = "Owner" | "Manager" | "Developer" | "Viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
