import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "@/features/auth/auth-storage";
import { authEventBus } from "@/features/auth/auth-event-bus";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Cancellation Bus
const activeRequests = new Set<AbortController>();

const createAbortController = (config: InternalAxiosRequestConfig) => {
  const controller = new AbortController();
  config.signal = controller.signal;
  activeRequests.add(controller);
  return controller;
};

const removeAbortController = (controller: AbortController) => {
  activeRequests.delete(controller);
};

// Cancel all pending requests
export const cancelAllRequests = () => {
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
};

// Listen to auth logout to trigger active cancellations
authEventBus.on("logout", () => {
  cancelAllRequests();
});

// Interceptors Tracker Singleton
let isInterceptorsRegistered = false;
let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const registerInterceptors = () => {
  if (isInterceptorsRegistered) {
    if (requestInterceptorId !== null) api.interceptors.request.eject(requestInterceptorId);
    if (responseInterceptorId !== null) api.interceptors.response.eject(responseInterceptorId);
  }

  // Request Interceptor
  requestInterceptorId = api.interceptors.request.use(
    (config) => {
      // Create controller for request cancellation support
      const controller = createAbortController(config);
      
      // Store reference to abort controller on config object
      (config as any)._abortController = controller;

      const token = authStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  responseInterceptorId = api.interceptors.response.use(
    (response) => {
      // Clean up request abort controller reference
      const controller = (response.config as any)._abortController;
      if (controller) removeAbortController(controller);
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config;
      if (config) {
        const controller = (config as any)._abortController;
        if (controller) removeAbortController(controller);
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & { 
        _retryCount?: number;
      };

      // Standard error formatting
      const errData: any = error.response?.data;
      const message = errData?.detail || error.message || "An unexpected error occurred.";

      // Max retry validation to prevent infinite loops (Limit to 1 retry)
      const retryCount = originalRequest?._retryCount || 0;

      if (error.response?.status === 401 && retryCount < 1 && originalRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                resolve(api(originalRequest));
              },
              reject: (err) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        isRefreshing = true;

        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          authStorage.clearTokens();
          isRefreshing = false;
          authEventBus.emit("session-expired");
          return Promise.reject(new Error("No refresh token available"));
        }

        try {
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          authStorage.setAccessToken(accessToken);
          authStorage.setRefreshToken(newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          authStorage.clearTokens();
          isRefreshing = false;
          
          authEventBus.emit("session-expired");
          
          return Promise.reject(new Error("Session expired. Please log in again."));
        }
      }

      return Promise.reject(new Error(message));
    }
  );

  isInterceptorsRegistered = true;
};

// Auto-register interceptors on import
registerInterceptors();
