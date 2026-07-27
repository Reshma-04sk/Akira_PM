export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  USERS: {
    ME: "/users/me",
    UPDATE_PROFILE: "/users/profile",
    LIST: "/users",
  },
  PROJECTS: {
    LIST: "/projects",
    CREATE: "/projects",
    DETAIL: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  PROJECT_MEMBERS: {
    LIST: (projectId: string) => `/project-members?project_id=${projectId}`,
    ADD: (projectId: string) => `/project-members?project_id=${projectId}`,
    UPDATE: (userId: string, projectId: string) => `/project-members/${userId}?project_id=${projectId}`,
    DELETE: (userId: string, projectId: string) => `/project-members/${userId}?project_id=${projectId}`,
  },
  TASKS: {
    LIST: (projectId: string) => `/projects/${projectId}/tasks`,
    CREATE: (projectId: string) => `/projects/${projectId}/tasks`,
    DETAIL: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    DRAG_DROP: (id: string) => `/tasks/${id}/move`,
  },
  COMMENTS: {
    LIST: (taskId: string) => `/tasks/${taskId}/comments`,
    CREATE: (taskId: string) => `/tasks/${taskId}/comments`,
    DELETE: (id: string) => `/comments/${id}`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    ACTIVITY: "/dashboard/activity",
    MY_TASKS: "/dashboard/my-tasks",
    PROJECT: (id: string) => `/dashboard/project/${id}`,
  },
  SEARCH: {
    GLOBAL: "/search",
  },
  ATTACHMENTS: {
    LIST: (taskId: string) => `/tasks/${taskId}/attachments`,
    UPLOAD: (taskId: string) => `/tasks/${taskId}/attachments`,
    DELETE: (id: string) => `/attachments/${id}`,
  },
} as const;
