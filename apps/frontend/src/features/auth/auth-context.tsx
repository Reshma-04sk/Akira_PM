import { createContext } from "react";
import { AuthState } from "./auth-types";

export interface AuthContextProps extends AuthState {
  login: (credentials: Record<string, string>, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthContextConsumer = AuthContext.Consumer;
