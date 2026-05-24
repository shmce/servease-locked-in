import {
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
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
import { AdminDisputeGatewayService } from './admin-dispute.service';
import { AdminDisputeSummary } from './admin-dispute.types';

const validDisputeStatuses = new Set(['open', 'resolved', 'closed']);

@Controller('v1/admin/disputes')
export class AdminDisputeController {
  private readonly logger = new Logger(AdminDisputeController.name);

  constructor(
    private readonly adminDisputeGatewayService: AdminDisputeGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: string,
  ): Promise<{ data: AdminDisputeSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validDisputeStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminDisputeGatewayService.listDisputes(
          status ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':disputeId')
  async show(
    @Headers('authorization') authorization: string | undefined,
    @Param('disputeId') disputeId: string,
  ): Promise<{ data: AdminDisputeSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminDisputeGatewayService.getDispute(disputeId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':disputeId/resolve')
  async resolve(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('disputeId') disputeId: string,
  ): Promise<{ data: AdminDisputeSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const dispute =
        await this.adminDisputeGatewayService.resolveDispute(disputeId);
      void this.adminAuditGatewayService
        .createAuditLog({
          adminUserId: admin.user.id,
          adminEmail: admin.user.email,
          adminName: admin.user.fullName,
          action: 'Resolved dispute',
          actionType: 'resolve',
          entityType: 'Dispute',
          entityId: dispute.id,
          details: `Resolved dispute ${dispute.id} for booking ${dispute.bookingId ?? 'unknown'}.`,
          ipAddress: this.getClientIp(request),
          metadata: {
            disputeId: dispute.id,
            bookingId: dispute.bookingId,
            amount: dispute.amount,
          },
        })
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not create dispute audit log for ${dispute.id}: ${this.errorMessage(error)}`,
          );
        });
      return {
        data: dispute,
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

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
