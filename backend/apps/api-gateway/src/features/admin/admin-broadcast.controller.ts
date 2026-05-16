import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
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
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminUsersGatewayService } from './admin-users.service';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { AdminAuditGatewayService } from './admin-audit.service';

type BroadcastAudience = 'admins' | 'all' | 'customers' | 'providers';

interface CreateBroadcastRequest {
  audience?: BroadcastAudience;
  title?: string;
  message?: string;
}

interface BroadcastResult {
  audience: BroadcastAudience;
  deliveredCount: number;
  failedCount: number;
}

type AuditRequest = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

@Controller('v1/admin/broadcasts')
export class AdminBroadcastController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly adminUsersGatewayService: AdminUsersGatewayService,
    private readonly notificationServiceClient: NotificationServiceClient,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
  ) {}

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Body() body: CreateBroadcastRequest,
  ): Promise<{ data: BroadcastResult }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const audience = body.audience ?? 'all';
      const title = body.title?.trim() ?? '';
      const message = body.message?.trim() ?? '';
      if (!this.isValidAudience(audience) || !title || !message) {
        throw new InvalidAdminRequestError();
      }

      const role = this.toUserRole(audience);
      const users = await this.adminUsersGatewayService.listUsers(
        role,
        'active',
        null,
      );
      const activeRecipients = users.filter((user) => user.status === 'active');
      const outcomes = await Promise.allSettled(
        activeRecipients.map((user) =>
          this.notificationServiceClient.createNotification({
            userId: user.id,
            type: 'admin_broadcast',
            title,
            body: message,
            metadata: {
              audience,
              adminUserId: admin.user.id,
            },
          }),
        ),
      );
      const deliveredCount = outcomes.filter(
        (outcome) => outcome.status === 'fulfilled',
      ).length;
      const failedCount = outcomes.length - deliveredCount;

      void this.recordAudit(admin, request, {
        audience,
        title,
        deliveredCount,
        failedCount,
      });

      return {
        data: {
          audience,
          deliveredCount,
          failedCount,
        },
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

  private isValidAudience(audience: string): audience is BroadcastAudience {
    return ['admins', 'all', 'customers', 'providers'].includes(audience);
  }

  private toUserRole(audience: BroadcastAudience): 'admin' | 'customer' | 'provider' | null {
    if (audience === 'customers') return 'customer';
    if (audience === 'providers') return 'provider';
    if (audience === 'admins') return 'admin';
    return null;
  }

  private recordAudit(
    admin: CurrentUserProfile,
    request: AuditRequest,
    input: {
      audience: BroadcastAudience;
      title: string;
      deliveredCount: number;
      failedCount: number;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService.createAuditLog({
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
        title: input.title,
        deliveredCount: input.deliveredCount,
        failedCount: input.failedCount,
      },
    }).catch(() => undefined);
  }

  private getClientIp(request: AuditRequest): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? null;
    return forwardedFor?.split(',')[0]?.trim() || request.socket?.remoteAddress || null;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }
    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    if (error instanceof InvalidAdminRequestError) {
      return this.error('invalid_admin_request', 'Admin request is invalid.', 400);
    }
    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
