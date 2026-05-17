import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { NotificationNotFoundError } from './notification.errors';
import {
  ActivePushDevice,
  CreateNotificationInput,
  NotificationMetadata,
  NotificationSummary,
  PushDevicePlatform,
  PushDeviceSummary,
  RegisterPushDeviceInput,
} from './notification.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<
      string,
      string | string[] | boolean | NotificationMetadata | null
    >,
  ): PromiseLike<{
    data: Array<
      | NotificationRow
      | PushDeviceRow
      | ActivePushDeviceRow
      | UnregisterPushDeviceRow
      | DeactivatePushDevicesRow
    > | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data:
        | NotificationRow
        | PushDeviceRow
        | ActivePushDeviceRow
        | UnregisterPushDeviceRow
        | DeactivatePushDevicesRow
        | null;
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

interface PushDeviceRow {
  id: string;
  user_id: string;
  token: string;
  platform: PushDevicePlatform;
  device_id: string | null;
  is_active: boolean | null;
  last_registered_at: string | null;
  created_at: string | null;
}

interface ActivePushDeviceRow {
  token: string;
  platform: PushDevicePlatform;
  device_id: string | null;
}

interface UnregisterPushDeviceRow {
  ok: boolean;
}

interface DeactivatePushDevicesRow {
  deactivated_count: number;
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

    return this.mapNotification(data as NotificationRow);
  }

  async listNotifications(userId: string): Promise<NotificationSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_notifications', {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to list notifications: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapNotification(row as NotificationRow));
  }

  async listActivePushDevices(userId: string): Promise<ActivePushDevice[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_active_push_devices',
      {
        p_user_id: userId,
      },
    );

    if (error) {
      throw new Error(`Failed to list active push devices: ${error.message}`);
    }

    return (data ?? []).map((row) =>
      this.mapActivePushDevice(row as ActivePushDeviceRow),
    );
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

    return this.mapNotification(data as NotificationRow);
  }

  async registerPushDevice(
    input: RegisterPushDeviceInput,
  ): Promise<PushDeviceSummary> {
    const { data, error } = await this.client
      .rpc('servease_register_push_device', {
        p_user_id: input.userId,
        p_token: input.token,
        p_platform: input.platform,
        p_device_id: input.deviceId ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to register push device: ${error.message}`);
    }

    if (!data) {
      throw new NotificationNotFoundError();
    }

    return this.mapPushDevice(data as PushDeviceRow);
  }

  async unregisterPushDevice(
    userId: string,
    token: string,
  ): Promise<{ ok: boolean }> {
    const { data, error } = await this.client
      .rpc('servease_unregister_push_device', {
        p_user_id: userId,
        p_token: token,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to unregister push device: ${error.message}`);
    }

    return { ok: (data as UnregisterPushDeviceRow | null)?.ok ?? false };
  }

  async deactivatePushDevices(tokens: string[]): Promise<number> {
    if (tokens.length === 0) {
      return 0;
    }

    const { data, error } = await this.client
      .rpc('servease_deactivate_push_devices', {
        p_tokens: tokens,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to deactivate push devices: ${error.message}`);
    }

    return (data as DeactivatePushDevicesRow | null)?.deactivated_count ?? 0;
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

  private mapPushDevice(row: PushDeviceRow): PushDeviceSummary {
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      platform: row.platform,
      deviceId: row.device_id,
      isActive: row.is_active ?? false,
      lastRegisteredAt: row.last_registered_at,
      createdAt: row.created_at,
    };
  }

  private mapActivePushDevice(row: ActivePushDeviceRow): ActivePushDevice {
    return {
      token: row.token,
      platform: row.platform,
      deviceId: row.device_id,
    };
  }
}
