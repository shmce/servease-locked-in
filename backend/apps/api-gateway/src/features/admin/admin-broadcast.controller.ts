import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AdminRequiredError,
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminUsersGatewayService } from './admin-users.service';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminBroadcastAudience,
  AdminBroadcastChannel,
  AdminBroadcastRepeatRule,
  AdminBroadcastSummary,
  CreateAdminBroadcastRequest,
} from './admin-broadcast.types';

type AuditRequest = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

@Controller('v1/admin/broadcasts')
export class AdminBroadcastController {
  private readonly logger = new Logger(AdminBroadcastController.name);

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly adminUsersGatewayService: AdminUsersGatewayService,
    private readonly notificationServiceClient: NotificationServiceClient,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly adminServiceClient: AdminServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminBroadcastSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      const parsedLimit = limit ? Number(limit) : 100;
      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 500
      ) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminServiceClient.listBroadcasts(parsedLimit),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Body() body: CreateAdminBroadcastRequest,
  ): Promise<{ data: AdminBroadcastSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const audience = body.audience ?? 'all';
      const repeatRule = body.repeatRule ?? 'none';
      const title = body.title?.trim() ?? '';
      const message = body.message?.trim() ?? '';
      const audienceCohort = body.audienceCohort?.trim() || null;
      const channels = this.normalizeChannels(body.channels);
      const scheduledAt = body.scheduledAt?.trim() || null;
      const isScheduled =
        scheduledAt !== null && new Date(scheduledAt).getTime() > Date.now();
      if (
        !this.isValidAudience(audience) ||
        !this.isValidRepeatRule(repeatRule) ||
        !channels.length ||
        !title ||
        !message ||
        (scheduledAt && Number.isNaN(new Date(scheduledAt).getTime()))
      ) {
        throw new InvalidAdminRequestError();
      }

      const { deliveredCount, failedCount } = isScheduled
        ? { deliveredCount: 0, failedCount: 0 }
        : await this.deliverBroadcast(admin, {
            audience,
            audienceCohort,
            channels,
            title,
            message,
          });
      const broadcast = await this.adminServiceClient.createBroadcast({
        adminUserId: admin.user.id,
        audience,
        audienceCohort,
        title,
        message,
        status: isScheduled
          ? 'scheduled'
          : failedCount > 0 && deliveredCount === 0
            ? 'failed'
            : 'sent',
        scheduledAt,
        repeatRule,
        deliveredCount,
        failedCount,
      });

      void this.recordAudit(admin, request, {
        audience,
        audienceCohort,
        channels,
        title,
        status: broadcast.status,
        deliveredCount,
        failedCount,
      });

      return {
        data: broadcast,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
    return currentUser;
  }

  private isValidAudience(
    audience: string,
  ): audience is AdminBroadcastAudience {
    return ['admins', 'all', 'customers', 'providers'].includes(audience);
  }

  private isValidRepeatRule(
    repeatRule: string,
  ): repeatRule is AdminBroadcastRepeatRule {
    return ['none', 'daily', 'weekly', 'monthly'].includes(repeatRule);
  }

  private normalizeChannels(
    channels: AdminBroadcastChannel[] | undefined,
  ): AdminBroadcastChannel[] {
    if (!channels || channels.length === 0) {
      return ['in_app'];
    }

    const normalized = [...new Set(channels)];
    return normalized.every((channel) =>
      ['in_app', 'email', 'sms'].includes(channel),
    )
      ? normalized
      : [];
  }

  private toUserRole(
    audience: AdminBroadcastAudience,
  ): 'admin' | 'customer' | 'provider' | null {
    if (audience === 'customers') return 'customer';
    if (audience === 'providers') return 'provider';
    if (audience === 'admins') return 'admin';
    return null;
  }

  private async deliverBroadcast(
    admin: CurrentUserProfile,
    input: {
      audience: AdminBroadcastAudience;
      audienceCohort: string | null;
      channels: AdminBroadcastChannel[];
      title: string;
      message: string;
    },
  ): Promise<{ deliveredCount: number; failedCount: number }> {
    const role = this.toUserRole(input.audience);
    const users = await this.adminUsersGatewayService.listUsers(
      role,
      'active',
      input.audienceCohort,
    );
    const activeRecipients = users.filter((user) => user.status === 'active');
    const deliveries: Promise<unknown>[] = [];
    for (const user of activeRecipients) {
      const metadata = {
        audience: input.audience,
        audienceCohort: input.audienceCohort,
        adminUserId: admin.user.id,
      };

      for (const channel of input.channels) {
        if (channel === 'in_app') {
          deliveries.push(
            this.notificationServiceClient.createNotification({
              userId: user.id,
              type: 'admin_broadcast',
              title: input.title,
              body: input.message,
              metadata,
            }),
          );
        } else if (channel === 'email' && user.email) {
          deliveries.push(
            this.notificationServiceClient.sendSharedEmail({
              to: [{ email: user.email, name: user.fullName ?? undefined }],
              subject: input.title,
              text: input.message,
              metadata: {
                audience: input.audience,
                adminUserId: admin.user.id,
                userId: user.id,
              },
            }),
          );
        } else if (channel === 'sms' && user.contactNumber) {
          deliveries.push(
            this.notificationServiceClient.sendSharedSms({
              to: user.contactNumber,
              message: input.message,
              metadata: {
                audience: input.audience,
                adminUserId: admin.user.id,
                userId: user.id,
              },
            }),
          );
        }
      }
    }
    const outcomes = await Promise.allSettled(deliveries);
    const deliveredCount = outcomes.filter(
      (outcome) => outcome.status === 'fulfilled',
    ).length;
    return {
      deliveredCount,
      failedCount: outcomes.length - deliveredCount,
    };
  }

  private recordAudit(
    admin: CurrentUserProfile,
    request: AuditRequest,
    input: {
      audience: AdminBroadcastAudience;
      audienceCohort: string | null;
      channels: AdminBroadcastChannel[];
      title: string;
      status: string;
      deliveredCount: number;
      failedCount: number;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Sent admin broadcast',
        actionType: 'create',
        entityType: 'Broadcast',
        entityId: null,
        details: `${input.title} sent to ${input.audience}.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          audience: input.audience,
          audienceCohort: input.audienceCohort,
          channels: input.channels,
          title: input.title,
          status: input.status,
          deliveredCount: input.deliveredCount,
          failedCount: input.failedCount,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not create broadcast audit log for ${input.title}: ${this.errorMessage(error)}`,
        );
      });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private getClientIp(request: AuditRequest): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? null;
    return (
      forwardedFor?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      null
    );
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }
    if (error instanceof InvalidAuthTokenError) {
      return this.error(
        'invalid_auth_token',
        'Authentication token is invalid.',
        401,
      );
    }
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    if (error instanceof InvalidAdminRequestError) {
      return this.error(
        'invalid_admin_request',
        'Admin request is invalid.',
        400,
      );
    }
    if (error instanceof AdminServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
