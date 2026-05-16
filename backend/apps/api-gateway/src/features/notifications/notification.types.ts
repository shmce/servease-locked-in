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
