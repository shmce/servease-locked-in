import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { NotificationDependencyUnavailableError } from './notification.errors';
import { NotificationGatewayService } from './notification.service';
import {
  NotificationSummary,
  PushDeviceSummary,
  RegisterPushDeviceRequest,
} from './notification.types';

@Controller('v1/notifications')
export class NotificationController {
  constructor(
    private readonly notificationGatewayService: NotificationGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: NotificationSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.notificationGatewayService.listNotifications(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('devices')
  async registerPushDevice(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: RegisterPushDeviceRequest,
  ): Promise<{ data: PushDeviceSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.notificationGatewayService.registerPushDevice(
          userId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('devices/:token')
  async unregisterPushDevice(
    @Headers('authorization') authorization: string | undefined,
    @Param('token') token: string,
  ): Promise<{ data: { ok: boolean } }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.notificationGatewayService.unregisterPushDevice(
          userId,
          decodeURIComponent(token),
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':notificationId/read')
  async markRead(
    @Headers('authorization') authorization: string | undefined,
    @Param('notificationId') notificationId: string,
  ): Promise<{ data: NotificationSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.notificationGatewayService.markRead(
          notificationId,
          userId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof NotificationDependencyUnavailableError) {
      return this.error(
        'notification_dependency_unavailable',
        'Notification service is unavailable.',
        503,
      );
    }

    return this.error(
      'notification_dependency_unavailable',
      'Notification request failed.',
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
