export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginatedAPIResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
}
