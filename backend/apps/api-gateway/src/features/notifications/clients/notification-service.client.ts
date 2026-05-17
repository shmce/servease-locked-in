import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationDependencyUnavailableError } from '../notification.errors';
import {
  CreateNotificationRequest,
  NotificationSummary,
  PushDeviceSummary,
  RegisterPushDeviceRequest,
  SharedEmailSendRequest,
  SharedMessageResponse,
  SharedSmsSendRequest,
} from '../notification.types';

@Injectable()
export class NotificationServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listNotifications(userId: string): Promise<NotificationSummary[]> {
    return this.request<NotificationSummary[]>(
      `/internal/notifications?userId=${encodeURIComponent(userId)}`,
      'GET',
    );
  }

  markRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationSummary> {
    return this.request<NotificationSummary>(
      `/internal/notifications/${notificationId}/read`,
      'PATCH',
      {
        userId,
      },
    );
  }

  createNotification(
    input: CreateNotificationRequest,
  ): Promise<NotificationSummary> {
    return this.request<NotificationSummary>(
      '/internal/notifications',
      'POST',
      input,
    );
  }

  registerPushDevice(
    input: RegisterPushDeviceRequest & { userId: string },
  ): Promise<PushDeviceSummary> {
    return this.request<PushDeviceSummary>(
      '/internal/notifications/devices',
      'POST',
      input,
    );
  }

  unregisterPushDevice(
    userId: string,
    token: string,
  ): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(
      `/internal/notifications/devices/${encodeURIComponent(token)}`,
      'DELETE',
      { userId },
    );
  }

  sendSharedEmail(input: SharedEmailSendRequest): Promise<SharedMessageResponse> {
    return this.request<SharedMessageResponse>(
      '/internal/shared-messaging/email/send',
      'POST',
      input,
    );
  }

  sendSharedSms(input: SharedSmsSendRequest): Promise<SharedMessageResponse> {
    return this.request<SharedMessageResponse>(
      '/internal/shared-messaging/sms/send',
      'POST',
      input,
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:8509',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new NotificationDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
