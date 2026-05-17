import { Injectable } from '@nestjs/common';
import { NotificationServiceClient } from './clients/notification-service.client';
import {
  NotificationSummary,
  PushDeviceSummary,
  RegisterPushDeviceRequest,
} from './notification.types';

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

  registerPushDevice(
    userId: string,
    input: RegisterPushDeviceRequest,
  ): Promise<PushDeviceSummary> {
    return this.notificationServiceClient.registerPushDevice({
      userId,
      token: input.token,
      platform: input.platform,
      deviceId: input.deviceId ?? null,
    });
  }

  unregisterPushDevice(
    userId: string,
    token: string,
  ): Promise<{ ok: boolean }> {
    return this.notificationServiceClient.unregisterPushDevice(userId, token);
  }
}
