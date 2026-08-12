import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import { RequestConfig } from "./request";
import { ApiResponse } from "./response";
import { Task } from "./tasks.api";

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

export interface DashboardActivity {
  activities: any[];
}

export interface DashboardMyTasks {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface SprintVelocityPoint {
  label: string;
  tasks_shipped: number;
  total_tasks: number;
}

export interface DashboardAnalytics {
  velocity_history: SprintVelocityPoint[];
  avg_cycle_time_days: number | null;
  completion_rate_percent: number;
}

export const dashboardApi = {
  getOverview(config?: RequestConfig): Promise<ApiResponse<DashboardOverview>> {
    return apiClient.get<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW, config);
  },

  getAnalytics(config?: RequestConfig): Promise<ApiResponse<DashboardAnalytics>> {
    return apiClient.get<DashboardAnalytics>(ENDPOINTS.DASHBOARD.ANALYTICS, config);
  },

  getProjectStats(projectId: string, config?: RequestConfig): Promise<ApiResponse<DashboardProjectOverview>> {
    return apiClient.get<DashboardProjectOverview>(ENDPOINTS.DASHBOARD.PROJECT(projectId), config);
  },

  getActivity(limit?: number, config?: RequestConfig): Promise<ApiResponse<DashboardActivity>> {
    const url = limit ? `${ENDPOINTS.DASHBOARD.ACTIVITY}?limit=${limit}` : ENDPOINTS.DASHBOARD.ACTIVITY;
    return apiClient.get<DashboardActivity>(url, config);
  },

  getMyTasks(page?: number, pageSize?: number, config?: RequestConfig): Promise<ApiResponse<DashboardMyTasks>> {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (pageSize) params.append("page_size", String(pageSize));
    const url = params.toString() ? `${ENDPOINTS.DASHBOARD.MY_TASKS}?${params.toString()}` : ENDPOINTS.DASHBOARD.MY_TASKS;
    return apiClient.get<DashboardMyTasks>(url, config);
  },
};
