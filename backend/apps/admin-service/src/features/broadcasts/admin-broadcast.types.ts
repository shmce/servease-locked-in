export type AdminBroadcastAudience = 'admins' | 'all' | 'customers' | 'providers';
export type AdminBroadcastRepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';
export type AdminBroadcastStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';

export interface AdminBroadcastSummary {
  id: string;
  adminUserId: string;
  audience: AdminBroadcastAudience;
  audienceCohort: string | null;
  title: string;
  message: string;
  status: AdminBroadcastStatus;
  scheduledAt: string | null;
  repeatRule: AdminBroadcastRepeatRule;
  deliveredCount: number;
  failedCount: number;
  sentAt: string | null;
  createdAt: string | null;
}

export interface CreateAdminBroadcastInput {
  adminUserId: string;
  audience: AdminBroadcastAudience;
  audienceCohort?: string | null;
  title: string;
  message: string;
  status: AdminBroadcastStatus;
  scheduledAt?: string | null;
  repeatRule?: AdminBroadcastRepeatRule | null;
  deliveredCount?: number | null;
  failedCount?: number | null;
}
