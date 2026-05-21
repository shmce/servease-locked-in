import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  InvalidNotificationRequestError,
  NotificationNotFoundError,
} from './notification.errors';
import { NotificationService } from './notification.service';
import {
  NotificationMetadata,
  NotificationSummary,
  PushDeviceSummary,
} from './notification.types';

@Controller('internal/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async list(@Query('userId') userId?: string): Promise<{ data: NotificationSummary[] }> {
    try {
      return {
        data: await this.notificationService.listNotifications(userId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      userId: string;
      type: string;
      title?: string | null;
      body?: string | null;
      metadata?: NotificationMetadata;
    },
  ): Promise<{ data: NotificationSummary }> {
    try {
      return {
        data: await this.notificationService.createNotification(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('devices')
  async registerPushDevice(
    @Body()
    body: {
      userId: string;
      token: string;
      platform: string;
      deviceId?: string | null;
    },
  ): Promise<{ data: PushDeviceSummary }> {
    try {
      return {
        data: await this.notificationService.registerPushDevice(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('devices/:token')
  async unregisterPushDevice(
    @Param('token') token: string,
    @Body() body: { userId: string },
  ): Promise<{ data: { ok: boolean } }> {
    try {
      return {
        data: await this.notificationService.unregisterPushDevice(
          body.userId,
          decodeURIComponent(token),
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':notificationId/read')
  async markRead(
    @Param('notificationId') notificationId: string,
    @Body() body: { userId: string },
  ): Promise<{ data: NotificationSummary }> {
    try {
      return {
        data: await this.notificationService.markRead(notificationId, body.userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidNotificationRequestError) {
      return this.error(
        'invalid_notification_request',
        'Notification request is invalid.',
        400,
      );
    }

    if (error instanceof NotificationNotFoundError) {
      return this.error('notification_not_found', 'Notification was not found.', 404);
    }

    return this.error(
      'notification_dependency_unavailable',
      'Notification service failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
