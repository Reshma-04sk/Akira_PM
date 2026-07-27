import { api } from "@/lib/axios";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";
import { ApiError } from "./api-error";

export const apiClient = {
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw ApiError.parse(error);
    }
  },

  async post<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw ApiError.parse(error);
    }
  },

  async put<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw ApiError.parse(error);
    }
  },

  async patch<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw ApiError.parse(error);
    }
  },

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw ApiError.parse(error);
    }
  },
};
