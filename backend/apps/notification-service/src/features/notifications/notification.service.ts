import { Injectable } from '@nestjs/common';
import { InvalidNotificationRequestError } from './notification.errors';
import {
  CreateNotificationInput,
  NotificationSummary,
} from './notification.types';
import { SupabaseNotificationRepository } from './supabase-notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: SupabaseNotificationRepository) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationSummary> {
    const type = input.type.trim();
    if (!input.userId || !type) {
      throw new InvalidNotificationRequestError();
    }

    return this.notificationRepository.createNotification({
      userId: input.userId,
      type,
      title: input.title?.trim() || null,
      body: input.body?.trim() || null,
      metadata: input.metadata ?? null,
    });
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
}
