import { Injectable, Logger } from '@nestjs/common';
import { InvalidNotificationRequestError } from './notification.errors';
import {
  CreateNotificationInput,
  NotificationSummary,
  PushDevicePlatform,
  PushDeviceSummary,
  RegisterPushDeviceInput,
} from './notification.types';
import {
  PushDeliveryClient,
  PushReceiptCheck,
} from './push-delivery.client';
import { SupabaseNotificationRepository } from './supabase-notification.repository';
import { UserPreferenceClient } from './user-preference.client';

const notificationPreferenceKeys: Record<string, string> = {
  admin_booking_escalated: 'bookingModifications',
  admin_broadcast: 'platformUpdates',
  admin_provider_message: 'customerMessages',
  booking_cancelled_by_admin: 'bookingCancellations',
  booking_created: 'newBookingRequests',
  booking_status_updated: 'bookingModifications',
  payment_reserved: 'paymentReceived',
  provider_application_approved: 'platformUpdates',
  provider_application_info_requested: 'platformUpdates',
  review_created: 'platformUpdates',
  support_reply: 'platformUpdates',
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: SupabaseNotificationRepository,
    private readonly pushDeliveryClient: PushDeliveryClient,
    private readonly userPreferenceClient?: UserPreferenceClient,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationSummary> {
    const type = input.type.trim();
    if (!input.userId || !type) {
      throw new InvalidNotificationRequestError();
    }

    const notification = await this.notificationRepository.createNotification({
      userId: input.userId,
      type,
      title: input.title?.trim() || null,
      body: input.body?.trim() || null,
      metadata: input.metadata ?? null,
    });

    await this.deliverPushNotification(notification);

    return notification;
  }

  async listNotifications(userId: string): Promise<NotificationSummary[]> {
    if (!userId) {
      throw new InvalidNotificationRequestError();
    }

    return this.notificationRepository.listNotifications(userId);
  }

  async markRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationSummary> {
    if (!notificationId || !userId) {
      throw new InvalidNotificationRequestError();
    }

    return this.notificationRepository.markRead(notificationId, userId);
  }

  async registerPushDevice(
    input: RegisterPushDeviceInput,
  ): Promise<PushDeviceSummary> {
    const token = input.token?.trim();
    const platform = input.platform?.trim() as PushDevicePlatform;
    if (
      !input.userId ||
      !token ||
      !['android', 'ios', 'web'].includes(platform)
    ) {
      throw new InvalidNotificationRequestError();
    }

    return this.notificationRepository.registerPushDevice({
      userId: input.userId,
      token,
      platform,
      deviceId: input.deviceId?.trim() || null,
    });
  }

  async unregisterPushDevice(
    userId: string,
    token: string,
  ): Promise<{ ok: boolean }> {
    if (!userId || !token?.trim()) {
      throw new InvalidNotificationRequestError();
    }

    return this.notificationRepository.unregisterPushDevice(
      userId,
      token.trim(),
    );
  }

  private async deliverPushNotification(
    notification: NotificationSummary,
  ): Promise<void> {
    try {
      const canDeliver = await this.canDeliverPush(notification);
      if (!canDeliver) {
        return;
      }

      const devices = await this.notificationRepository.listActivePushDevices(
        notification.userId,
      );
      const result = await this.pushDeliveryClient.sendNotification(
        devices,
        notification,
      );
      if (result.invalidTokens.length > 0) {
        await this.notificationRepository.deactivatePushDevices(
          result.invalidTokens,
        );
      }
      this.schedulePushReceiptCheck(notification.id, result.receiptChecks ?? []);
    } catch (error) {
      this.logger.warn(
        `Push delivery failed for notification ${notification.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async canDeliverPush(
    notification: NotificationSummary,
  ): Promise<boolean> {
    if (!this.userPreferenceClient) {
      return true;
    }

    try {
      const preferences = await this.userPreferenceClient.getByUserId(
        notification.userId,
      );
      if (!preferences.pushNotificationsEnabled) {
        return false;
      }

      const preferenceKey = notificationPreferenceKeys[notification.type];
      if (!preferenceKey) {
        return true;
      }

      const preferenceValue =
        preferences.notificationPreferences?.[preferenceKey];
      return preferenceValue !== false;
    } catch (error) {
      this.logger.warn(
        `Preference lookup failed for notification ${notification.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return true;
    }
  }

  private schedulePushReceiptCheck(
    notificationId: string,
    receiptChecks: PushReceiptCheck[],
  ): void {
    if (receiptChecks.length === 0) {
      return;
    }

    const delayMs = this.receiptDelayMs();
    if (delayMs === 0) {
      void this.checkPushReceipts(notificationId, receiptChecks);
      return;
    }

    const timer = setTimeout(() => {
      void this.checkPushReceipts(notificationId, receiptChecks);
    }, delayMs);
    timer.unref?.();
  }

  private async checkPushReceipts(
    notificationId: string,
    receiptChecks: PushReceiptCheck[],
  ): Promise<void> {
    try {
      const result = await this.pushDeliveryClient.checkReceipts(receiptChecks);
      if (result.invalidTokens.length > 0) {
        await this.notificationRepository.deactivatePushDevices(
          result.invalidTokens,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Push receipt check failed for notification ${notificationId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private receiptDelayMs(): number {
    const value = Number(
      process.env.EXPO_PUSH_RECEIPT_DELAY_MS ?? 15 * 60 * 1000,
    );
    if (!Number.isFinite(value)) {
      return 15 * 60 * 1000;
    }

    return Math.min(Math.max(Math.floor(value), 0), 60 * 60 * 1000);
  }
}
