import React, { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./auth-context";
import { AuthState } from "./auth-types";
import { authService } from "./auth-service";
import { authStorage } from "./auth-storage";
import { authEventBus } from "./auth-event-bus";
import { queryClient } from "@/app/query-provider";

type AuthProviderProps = {
  children: React.ReactNode;
};

// Simple JWT decoder helper to determine time remaining
const getExpirationTimeMs = (token: string): number | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(window.atob(parts[1]));
    if (!payload.exp) return null;
    return payload.exp * 1000; // Returns ms timestamp
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    status: "Loading",
    user: null,
    error: null,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleRefreshTimer = useCallback((token: string) => {
    clearRefreshTimer();
    const expTime = getExpirationTimeMs(token);
    if (!expTime) return;

    // Refresh 1 minute before expiration
    const delay = expTime - Date.now() - 60000;
    if (delay > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refresh();
      }, delay);
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "Loading" }));
    clearRefreshTimer();
    
    // Evict all query cache items
    queryClient.clear();

    // Trigger abort controllers cancellation
    authEventBus.emit("logout");
    
    await authService.logout();
    setState({
      status: "Unauthenticated",
      user: null,
      error: null,
    });
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      setState({ status: "Unauthenticated", user: null, error: null });
      return;
    }

    try {
      setState((prev) => ({ ...prev, status: "Refreshing" }));
      const tokens = await authService.refreshToken(refreshToken);
      authStorage.setAccessToken(tokens.accessToken);
      authStorage.setRefreshToken(tokens.refreshToken);
      
      const user = await authService.getCurrentUser();
      setState({ status: "Authenticated", user, error: null });
      
      scheduleRefreshTimer(tokens.accessToken);
    } catch (err: any) {
      authStorage.clearTokens();
      clearRefreshTimer();
      queryClient.clear();
      setState({
        status: "Unauthenticated",
        user: null,
        error: err.message || "Failed to refresh token",
      });
    }
  }, [scheduleRefreshTimer]);

  const login = useCallback(
    async (credentials: Record<string, string>, rememberMe = true) => {
      try {
        setState((prev) => ({ ...prev, status: "Loading", error: null }));
        
        // Save remember-me preference
        authStorage.setRememberMe(rememberMe);

        const tokens = await authService.login(credentials);
        authStorage.setAccessToken(tokens.accessToken);
        authStorage.setRefreshToken(tokens.refreshToken);
        
        const user = await authService.getCurrentUser();
        setState({ status: "Authenticated", user, error: null });
        
        scheduleRefreshTimer(tokens.accessToken);
        authEventBus.emit("login", user);
      } catch (err: any) {
        authStorage.clearTokens();
        clearRefreshTimer();
        queryClient.clear();
        setState({
          status: "Unauthenticated",
          user: null,
          error: err.message || "Login failed",
        });
        throw err;
      }
    },
    [scheduleRefreshTimer]
  );

  // Initialize and check active user on mount, and listen to event bus
  useEffect(() => {
    const handleSessionExpired = () => {
      clearRefreshTimer();
      queryClient.clear();
      setState({
        status: "Expired",
        user: null,
        error: "Session expired. Please log in again.",
      });
    };

    const unsubscribeExpired = authEventBus.on("session-expired", handleSessionExpired);

    const initializeAuth = async () => {
      const accessToken = authStorage.getAccessToken();
      const refreshToken = authStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        setState({ status: "Unauthenticated", user: null, error: null });
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        setState({ status: "Authenticated", user, error: null });
        scheduleRefreshTimer(accessToken);
      } catch {
        // Access token expired, attempt refresh
        await refresh();
      }
    };

    initializeAuth();

    return () => {
      unsubscribeExpired();
      clearRefreshTimer();
    };
  }, [refresh, scheduleRefreshTimer]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
