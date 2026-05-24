import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AdminDependencyUnavailableError,
  AdminRequiredError,
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { PaymentSummary, PayoutSummary } from './admin-payment.types';

const validPaymentStatuses = new Set([
  'pending',
  'paid',
  'cancelled',
  'refunded',
]);
const validPayoutStatuses = new Set([
  'requested',
  'processing',
  'paid',
  'cancelled',
]);

@Controller('v1/admin/payments')
export class AdminPaymentController {
  private readonly logger = new Logger(AdminPaymentController.name);

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
  ): Promise<{ data: PaymentSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validPaymentStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPaymentGatewayService.listPayments(
          status ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  // Static prefix routes BEFORE :paymentId, otherwise the wildcard captures
  // them (e.g. /failures would resolve to getPayment("failures")). See
  // feedback-route-order.

  @Get('payouts')
  async listPayouts(
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

  @Get('failures')
  async listFailures(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PaymentSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      const all = await this.adminPaymentGatewayService.listPayments(null);
      return {
        data: all.filter(
          (p) => p.status === 'cancelled' || p.status === 'refunded',
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('settlements/:settlementId/approve')
  async approveSettlement(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('settlementId') settlementId: string,
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payout = await this.adminPaymentGatewayService.updatePayoutStatus(
        settlementId,
        'processing',
      );
      void this.recordAudit(admin, request, {
        action: 'Approved settlement for processing',
        actionType: 'approve',
        entityType: 'Settlement',
        entityId: payout.id,
        details: `Settlement ${payout.reference ?? payout.id} for provider ${payout.providerId} approved for processing.`,
        metadata: {
          payoutId: payout.id,
          providerId: payout.providerId,
          status: payout.status,
        },
      });
      return { data: payout };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('payouts/:payoutId/status')
  async updatePayoutStatus(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('payoutId') payoutId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.status || !validPayoutStatuses.has(body.status)) {
        throw new InvalidAdminRequestError();
      }
      const payout = await this.adminPaymentGatewayService.updatePayoutStatus(
        payoutId,
        body.status,
      );
      void this.recordAudit(admin, request, {
        action: `Updated payout status to ${body.status}`,
        actionType: body.status === 'paid' ? 'approve' : 'update',
        entityType: 'Payout',
        entityId: payout.id,
        details: `Payout ${payout.id} for provider ${payout.providerId} is now ${payout.status}.`,
        metadata: {
          payoutId: payout.id,
          providerId: payout.providerId,
          status: payout.status,
        },
      });
      return {
        data: payout,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  // :paymentId catch-all routes go LAST so static prefixes resolve first.

  @Get(':paymentId')
  async get(
    @Headers('authorization') authorization: string | undefined,
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminPaymentGatewayService.getPayment(paymentId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':paymentId/status')
  async updatePaymentStatus(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('paymentId') paymentId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PaymentSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.status || !validPaymentStatuses.has(body.status)) {
        throw new InvalidAdminRequestError();
      }
      const payment = await this.adminPaymentGatewayService.updatePaymentStatus(
        paymentId,
        body.status,
      );
      void this.recordAudit(admin, request, {
        action: `Updated payment status to ${body.status}`,
        actionType: 'update',
        entityType: 'Payment',
        entityId: payment.id,
        details: `Payment ${payment.id} for booking ${payment.bookingId} is now ${payment.status}.`,
        metadata: {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          status: payment.status,
        },
      });
      return {
        data: payment,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/failure')
  async recordFailure(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('paymentId') paymentId: string,
    @Body()
    body: {
      failureReason?: string;
      failureCode?: string | null;
      disputeId?: string | null;
    },
  ): Promise<{ data: PaymentSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.failureReason || !body.failureReason.trim()) {
        throw new InvalidAdminRequestError();
      }
      const payment =
        await this.adminPaymentGatewayService.recordPaymentFailure(
          paymentId,
          body.failureReason,
          body.failureCode ?? null,
          body.disputeId ?? null,
        );
      void this.recordAudit(admin, request, {
        action: 'Recorded payment failure metadata',
        actionType: 'update',
        entityType: 'Payment',
        entityId: payment.id,
        details: `Payment ${payment.id} marked with failure reason "${body.failureReason}".`,
        metadata: {
          paymentId: payment.id,
          failureReason: payment.failureReason,
          failureCode: payment.failureCode,
          disputeId: payment.disputeId,
        },
      });
      return { data: payment };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/retry')
  async retryPayment(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payment =
        await this.adminPaymentGatewayService.retryPayment(paymentId);
      void this.recordAudit(admin, request, {
        action: 'Re-queued failed payment for retry',
        actionType: 'update',
        entityType: 'Payment',
        entityId: payment.id,
        details: `Payment ${payment.id} retry attempt #${payment.retryCount} scheduled at ${payment.lastRetryAt ?? 'unknown'}.`,
        metadata: {
          paymentId: payment.id,
          retryCount: payment.retryCount,
          lastRetryAt: payment.lastRetryAt,
        },
      });
      return { data: payment };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/apicenter-sync')
  async syncPaymentWithApicenter(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payment =
        await this.adminPaymentGatewayService.syncPaymentWithApicenter(
          paymentId,
        );
      void this.recordAudit(admin, request, {
        action: 'Synced payment with APICenter',
        actionType: 'update',
        entityType: 'Payment',
        entityId: payment.id,
        details: `Payment ${payment.id} synced from APICenter checkout ${payment.apicenterCheckoutId ?? 'unknown'}.`,
        metadata: {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          status: payment.status,
          apicenterCheckoutId: payment.apicenterCheckoutId,
          apicenterCheckoutStatus: payment.apicenterCheckoutStatus,
        },
      });
      return { data: payment };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/release')
  async releasePaymentToProvider(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('paymentId') paymentId: string,
    @Body() body: { note?: string | null },
  ): Promise<{ data: PayoutSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const payout =
        await this.adminPaymentGatewayService.releasePaymentToProvider(
          paymentId,
          admin.user.id,
          body.note ?? null,
        );
      void this.recordAudit(admin, request, {
        action: 'Released payment to provider payout',
        actionType: 'approve',
        entityType: 'Payment',
        entityId: paymentId,
        details: `Payment ${paymentId} released as payout ${payout.reference ?? payout.id}.`,
        metadata: {
          paymentId,
          payoutId: payout.id,
          providerId: payout.providerId,
          status: payout.status,
        },
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
    input: {
      action: string;
      actionType: 'approve' | 'update';
      entityType: string;
      entityId: string;
      details: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: input.action,
        actionType: input.actionType,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.details,
        ipAddress: this.getClientIp(request),
        metadata: input.metadata,
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not create payment audit log for ${input.entityType} ${input.entityId}: ${this.errorMessage(error)}`,
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
