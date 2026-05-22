import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { CommissionRuleSummary } from './admin-payment.types';
import {
  AdminDependencyUnavailableError,
  AdminRequiredError,
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';

const validCommissionRuleStatuses = new Set(['active', 'pending', 'inactive']);

@Controller('v1/admin/commission-rules')
export class AdminCommissionController {
  private readonly logger = new Logger(AdminCommissionController.name);

  constructor(
    private readonly adminPaymentGatewayService: AdminPaymentGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: CommissionRuleSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminPaymentGatewayService.listCommissionRules(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':ruleId')
  async update(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('ruleId') ruleId: string,
    @Body()
    body: {
      currentRate?: number;
      status?: 'active' | 'pending' | 'inactive' | null;
    },
  ): Promise<{ data: CommissionRuleSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const status = body.status ?? 'active';
      const currentRate = Number(body.currentRate);
      if (
        !Number.isFinite(currentRate) ||
        currentRate < 0 ||
        currentRate > 100 ||
        !validCommissionRuleStatuses.has(status)
      ) {
        throw new InvalidAdminRequestError();
      }
      const rule = await this.adminPaymentGatewayService.updateCommissionRule(
        ruleId,
        {
          currentRate,
          status,
          adminUserId: admin.user.id,
        },
      );
      void this.recordAudit(admin, request, rule);
      return { data: rule };
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

  private recordAudit(
    admin: CurrentUserProfile,
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    rule: CommissionRuleSummary,
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Updated commission rule',
        actionType: 'update',
        entityType: 'CommissionRule',
        entityId: rule.id,
        details: `${rule.categoryLabel} commission is now ${rule.currentRate}%.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          ruleId: rule.id,
          categoryKey: rule.categoryKey,
          currentRate: rule.currentRate,
          previousRate: rule.previousRate,
          status: rule.status,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not create commission rule audit log for ${rule.id}: ${this.errorMessage(error)}`,
        );
      });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private getClientIp(request: {
    headers?: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
  }): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? null;
    }

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

    if (error instanceof AdminDependencyUnavailableError) {
      return this.error(
        'admin_dependency_unavailable',
        'Admin service is unavailable.',
        503,
      );
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin request failed.',
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
