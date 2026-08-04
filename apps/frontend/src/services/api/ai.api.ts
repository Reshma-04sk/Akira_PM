import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface AIConfigData {
  active_provider: string;
  openai_configured: boolean;
  gemini_configured: boolean;
  anthropic_configured: boolean;
}

export interface AIHealthData {
  openai: string; // "healthy" | "unconfigured" | "unhealthy"
  gemini: string;
  anthropic: string;
}

export interface AITestRequestPayload {
  prompt: string;
  provider?: string;
}

export interface AITestResponseData {
  success: boolean;
  text: string;
  provider: string;
  latency: number;
  estimated_tokens: number;
}

export const aiApi = {
  getConfig(config?: RequestConfig): Promise<ApiResponse<AIConfigData>> {
    return apiClient.get<AIConfigData>(ENDPOINTS.AI.CONFIG, config);
  },

  getHealth(config?: RequestConfig): Promise<ApiResponse<AIHealthData>> {
    return apiClient.get<AIHealthData>(ENDPOINTS.AI.HEALTH, config);
  },

  testGenerate(
    payload: AITestRequestPayload,
    config?: RequestConfig
  ): Promise<ApiResponse<AITestResponseData>> {
    return apiClient.post<AITestResponseData>(ENDPOINTS.AI.TEST, payload, config);
  },
};
