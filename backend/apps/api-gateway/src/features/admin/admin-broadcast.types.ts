export type AdminBroadcastAudience = 'admins' | 'all' | 'customers' | 'providers';
export type AdminBroadcastRepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';
export type AdminBroadcastStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';
export type AdminBroadcastChannel = 'in_app' | 'email' | 'sms';

export interface CreateAdminBroadcastRequest {
  audience?: AdminBroadcastAudience;
  audienceCohort?: string | null;
  channels?: AdminBroadcastChannel[];
  title?: string;
  message?: string;
  scheduledAt?: string | null;
  repeatRule?: AdminBroadcastRepeatRule | null;
}

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
