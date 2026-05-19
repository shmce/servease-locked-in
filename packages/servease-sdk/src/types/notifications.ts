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

export type PushDevicePlatform = 'android' | 'ios' | 'web';

export interface RegisterPushDeviceRequest {
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
