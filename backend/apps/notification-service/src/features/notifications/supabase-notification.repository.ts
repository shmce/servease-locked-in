import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { NotificationNotFoundError } from './notification.errors';
import {
  CreateNotificationInput,
  NotificationMetadata,
  NotificationSummary,
} from './notification.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | boolean | NotificationMetadata | null>,
  ): PromiseLike<{
    data: NotificationRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: NotificationRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  is_read: boolean | null;
  metadata: NotificationMetadata;
  created_at: string | null;
}

@Injectable()
export class SupabaseNotificationRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_notification', {
        p_user_id: input.userId,
        p_type: input.type,
        p_title: input.title ?? null,
        p_body: input.body ?? null,
        p_metadata: input.metadata ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    if (!data) {
      throw new NotificationNotFoundError();
    }

    return this.mapNotification(data);
  }

  async listNotifications(userId: string): Promise<NotificationSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_notifications', {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to list notifications: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapNotification(row));
  }

  async markRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationSummary> {
    const { data, error } = await this.client
      .rpc('servease_mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to mark notification read: ${error.message}`);
    }

    if (!data) {
      throw new NotificationNotFoundError();
    }

    return this.mapNotification(data);
  }

  private mapNotification(row: NotificationRow): NotificationSummary {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      isRead: row.is_read ?? false,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}
