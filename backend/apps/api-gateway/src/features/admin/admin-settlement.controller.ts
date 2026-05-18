import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AdminDependencyUnavailableError,
  InvalidAdminRequestError,
  AdminRequiredError,
  AdminServiceRequestError,
} from './admin-support.errors';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { PayoutEventSummary, PayoutSummary } from './admin-payment.types';

type AuditRequest = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

const validPayoutStatuses = new Set([
  'requested',
  'processing',
  'paid',
  'cancelled',
]);

@Controller('v1/admin/settlements')
export class AdminSettlementController {
  constructor(
    private readonly adminPaymentGatewayService: AdminPaymentGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: string,
  ): Promise<{ data: PayoutSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validPayoutStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPaymentGatewayService.listPayouts(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':settlementId/approve')
  async approve(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('settlementId') settlementId: string,
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payout = await this.adminPaymentGatewayService.updatePayoutStatus(
        settlementId,
        'processing',
      );
      await this.adminPaymentGatewayService.recordPayoutEvent(settlementId, {
        eventType: 'approved',
        status: 'processing',
        note: 'Approved for payout processing.',
        adminUserId: admin.user.id,
      });
      void this.recordAudit(admin, request, payout);
      return { data: payout };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':settlementId/reject')
  async reject(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('settlementId') settlementId: string,
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payout = await this.adminPaymentGatewayService.updatePayoutStatus(
        settlementId,
        'cancelled',
      );
      await this.adminPaymentGatewayService.recordPayoutEvent(settlementId, {
        eventType: 'rejected',
        status: 'cancelled',
        note: 'Rejected by admin.',
        adminUserId: admin.user.id,
      });
      void this.recordAudit(admin, request, payout, {
        action: 'Rejected settlement payout',
        actionType: 'reject',
        details: `Settlement ${payout.reference ?? payout.id} for provider ${payout.providerId} was rejected.`,
      });
      return { data: payout };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':settlementId/history')
  async history(
    @Headers('authorization') authorization: string | undefined,
    @Param('settlementId') settlementId: string,
  ): Promise<{ data: PayoutEventSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (!settlementId?.trim()) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPaymentGatewayService.listPayoutEvents(
          settlementId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':settlementId/reconcile')
  async reconcile(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('settlementId') settlementId: string,
    @Body() body: { bankReference?: string | null; note?: string | null },
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const bankReference = body.bankReference?.trim() ?? '';
      if (!settlementId?.trim() || !bankReference) {
        throw new InvalidAdminRequestError();
      }
      const payout = await this.adminPaymentGatewayService.updatePayoutStatus(
        settlementId,
        'paid',
      );
      await this.adminPaymentGatewayService.recordPayoutEvent(settlementId, {
        eventType: 'bank_reference_reconciled',
        status: 'paid',
        bankReference,
        note: body.note?.trim() || null,
        adminUserId: admin.user.id,
      });
      void this.recordAudit(admin, request, payout, {
        action: 'Reconciled settlement payout',
        actionType: 'update',
        details: `Settlement ${payout.reference ?? payout.id} was reconciled with bank reference ${bankReference}.`,
      });
      return { data: payout };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') throw new AdminRequiredError();
    return currentUser;
  }

  private recordAudit(
    admin: CurrentUserProfile,
    request: AuditRequest,
    payout: PayoutSummary,
    override?: {
      action: string;
      actionType: 'approve' | 'reject' | 'update';
      details: string;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: override?.action ?? 'Approved settlement for processing',
        actionType: override?.actionType ?? 'approve',
        entityType: 'Settlement',
        entityId: payout.id,
        details:
          override?.details ??
          `Settlement ${payout.reference ?? payout.id} for provider ${payout.providerId} approved for processing.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          payoutId: payout.id,
          providerId: payout.providerId,
          status: payout.status,
        },
      })
      .catch(() => undefined);
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
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
