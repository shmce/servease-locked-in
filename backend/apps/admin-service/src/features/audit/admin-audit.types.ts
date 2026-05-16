export type AdminAuditActionType =
  | 'approve'
  | 'create'
  | 'delete'
  | 'export'
  | 'login'
  | 'other'
  | 'reject'
  | 'resolve'
  | 'update';

export interface AdminAuditLogSummary {
  id: string;
  adminUserId: string;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  actionType: AdminAuditActionType;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: string | null;
}

export interface CreateAdminAuditLogInput {
  adminUserId: string;
  adminEmail?: string | null;
  adminName?: string | null;
  action: string;
  actionType: AdminAuditActionType;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListAdminAuditLogsFilter {
  adminUserId?: string | null;
  actionType?: AdminAuditActionType | null;
  entityType?: string | null;
  query?: string | null;
  from?: string | null;
  to?: string | null;
  limit?: number | null;
}
