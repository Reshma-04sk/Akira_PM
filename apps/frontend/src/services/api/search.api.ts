import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface SearchResult {
  projects: Array<{ id: string; name: string; description: string }>;
  tasks: Array<{ id: string; title: string; status: string; projectId: string }>;
  users: Array<{ id: string; email: string; full_name: string | null }>;
}

export const searchApi = {
  search(query: string, config?: RequestConfig): Promise<ApiResponse<SearchResult>> {
    // Standard get search passing query as search query parameter
    return apiClient.get<SearchResult>(`${ENDPOINTS.SEARCH.GLOBAL}?q=${encodeURIComponent(query)}`, config);
  },
};
