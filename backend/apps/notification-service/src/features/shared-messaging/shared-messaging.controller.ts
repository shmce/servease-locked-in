import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import {
  InvalidSharedMessagingRequestError,
  SharedMessagingDependencyUnavailableError,
} from './shared-messaging.errors';
import { SharedMessagingService } from './shared-messaging.service';
import {
  SharedEmailSendRequest,
  SharedMessageResponse,
  SharedMessageStatus,
  SharedSmsSendRequest,
} from './shared-messaging.types';

@Controller('internal/shared-messaging')
export class SharedMessagingController {
  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  @Post('email/send')
  async sendEmail(
    @Body() body: SharedEmailSendRequest,
  ): Promise<{ data: SharedMessageResponse }> {
    try {
      return { data: await this.sharedMessagingService.sendEmail(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('email/status/:messageId')
  async emailStatus(
    @Param('messageId') messageId: string,
  ): Promise<{ data: SharedMessageStatus }> {
    try {
      return { data: await this.sharedMessagingService.getEmailStatus(messageId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('sms/send')
  async sendSms(
    @Body() body: SharedSmsSendRequest,
  ): Promise<{ data: SharedMessageResponse }> {
    try {
      return { data: await this.sharedMessagingService.sendSms(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('sms/status/:messageId')
  async smsStatus(
    @Param('messageId') messageId: string,
  ): Promise<{ data: SharedMessageStatus }> {
    try {
      return { data: await this.sharedMessagingService.getSmsStatus(messageId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidSharedMessagingRequestError) {
      return this.error(
        'invalid_shared_messaging_request',
        'Shared messaging request is invalid.',
        400,
      );
    }

    if (error instanceof SharedMessagingDependencyUnavailableError) {
      return this.error(
        'shared_messaging_dependency_unavailable',
        'Shared messaging service is unavailable.',
        503,
      );
    }

    return this.error(
      'shared_messaging_dependency_unavailable',
      'Shared messaging request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}

