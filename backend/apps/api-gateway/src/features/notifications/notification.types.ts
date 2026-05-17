export type NotificationMetadata = Record<string, unknown> | null;

export interface NotificationSummary {
  id: string;
  userId: string;
  type: string;
  title: string | null;
  body: string | null;
  isRead: boolean;
  metadata: NotificationMetadata;
  createdAt: string | null;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title?: string | null;
  body?: string | null;
  metadata?: NotificationMetadata;
}

export type PushDevicePlatform = 'android' | 'ios' | 'web';

export interface RegisterPushDeviceRequest {
  userId?: string;
  token: string;
  platform: PushDevicePlatform;
  deviceId?: string | null;
}

export interface PushDeviceSummary {
  id: string;
  userId: string;
  token: string;
  platform: PushDevicePlatform;
  deviceId: string | null;
  isActive: boolean;
  lastRegisteredAt: string | null;
  createdAt: string | null;
}

export interface SharedEmailRecipient {
  email: string;
  name?: string;
}

export interface SharedEmailSendRequest {
  to: SharedEmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface SharedSmsSendRequest {
  to: string;
  message: string;
  senderId?: string;
  metadata?: Record<string, string>;
}

export interface SharedMessageResponse {
  messageId: string;
  provider: string;
  status: 'queued' | 'sent' | 'failed';
}
