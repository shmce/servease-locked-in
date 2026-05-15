import { Injectable } from '@nestjs/common';
import { NotificationServiceClient } from './clients/notification-service.client';
import { NotificationSummary } from './notification.types';

@Injectable()
export class NotificationGatewayService {
  constructor(private readonly notificationServiceClient: NotificationServiceClient) {}

  listNotifications(userId: string): Promise<NotificationSummary[]> {
    return this.notificationServiceClient.listNotifications(userId);
  }

  markRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationSummary> {
    return this.notificationServiceClient.markRead(notificationId, userId);
  }
}
