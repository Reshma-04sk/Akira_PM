import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";

export interface DashboardOverview {
  projects_count: number;
  tasks_count: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_status: Record<string, number>;
}

export interface DashboardProjectOverview {
  tasks_count: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_status: Record<string, number>;
}

export const dashboardApi = {
  getOverview(config?: RequestConfig): Promise<ApiResponse<DashboardOverview>> {
    return apiClient.get<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW, config);
  },

  getProjectStats(projectId: string, config?: RequestConfig): Promise<ApiResponse<DashboardProjectOverview>> {
    return apiClient.get<DashboardProjectOverview>(ENDPOINTS.DASHBOARD.PROJECT(projectId), config);
  },
};
