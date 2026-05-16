import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationDependencyUnavailableError } from '../notification.errors';
import {
  CreateNotificationRequest,
  NotificationSummary,
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

  private async request<T>(
    path: string,
    method: 'GET' | 'PATCH' | 'POST',
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
