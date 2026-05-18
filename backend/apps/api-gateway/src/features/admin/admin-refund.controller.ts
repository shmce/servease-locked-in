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
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { RefundSummary } from './admin-payment.types';
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

const validRefundStatuses = new Set([
  'requested',
  'approved',
  'processed',
  'rejected',
]);

@Controller('v1/admin/refunds')
export class AdminRefundController {
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
  ): Promise<{ data: RefundSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validRefundStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPaymentGatewayService.listRefunds(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':refundId/approve')
  async approve(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('refundId') refundId: string,
    @Body() body: { reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const refund = await this.adminPaymentGatewayService.approveRefund(
        refundId,
        admin.user.id,
        body.reason ?? null,
      );
      void this.recordAudit(admin, request, refund, 'approve');
      return { data: refund };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':refundId/reject')
  async reject(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('refundId') refundId: string,
    @Body() body: { reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.reason?.trim()) {
        throw new InvalidAdminRequestError();
      }
      const refund = await this.adminPaymentGatewayService.rejectRefund(
        refundId,
        admin.user.id,
        body.reason.trim(),
      );
      void this.recordAudit(admin, request, refund, 'reject');
      return { data: refund };
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
    refund: RefundSummary,
    actionType: 'approve' | 'reject',
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: `${actionType === 'approve' ? 'Approved' : 'Rejected'} refund request`,
        actionType,
        entityType: 'Refund',
        entityId: refund.id,
        details: `Refund ${refund.id} for booking ${refund.bookingId} is now ${refund.status}.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          refundId: refund.id,
          paymentId: refund.paymentId,
          bookingId: refund.bookingId,
          status: refund.status,
        },
      })
      .catch(() => undefined);
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
