import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
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
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminBookingGatewayService } from './admin-booking.service';
import {
  AdminBookingEscalationPriority,
  AdminBookingStatus,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  CancelAdminBookingRequest,
  EscalateAdminBookingRequest,
} from './admin-booking.types';

const validStatuses = new Set<AdminBookingStatus>([
  'cancelled',
  'completed',
  'confirmed',
  'in_progress',
  'pending',
  'rejected',
]);
const validPriorities = new Set<AdminBookingEscalationPriority>([
  'critical',
  'high',
  'low',
  'medium',
]);

@Controller('v1/admin/bookings')
export class AdminBookingController {
  constructor(
    private readonly adminBookingGatewayService: AdminBookingGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get('operations/alerts')
  async operationsAlerts(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: AdminOperationsAlerts }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminBookingGatewayService.getOperationsAlerts(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('summary')
  async summary(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: AdminBookingsSummaryStats }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminBookingGatewayService.getBookingsSummary(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: AdminBookingStatus,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminBookingSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      const parsedLimit = limit ? Number(limit) : null;
      if (
        (status && !validStatuses.has(status)) ||
        (parsedLimit !== null &&
          (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 200))
      ) {
        throw new InvalidAdminRequestError();
      }

      return {
        data: await this.adminBookingGatewayService.listBookings({
          status: status ?? null,
          query: query ?? null,
          limit: parsedLimit,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId')
  async show(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      await this.requireAdmin(authorization);
      if (!bookingId) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminBookingGatewayService.getBooking(bookingId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/cancel')
  async cancel(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    @Param('bookingId') bookingId: string,
    @Body() body: CancelAdminBookingRequest,
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!bookingId || !body.reason?.trim()) {
        throw new InvalidAdminRequestError();
      }
      const booking = await this.adminBookingGatewayService.cancelBooking(
        bookingId,
        admin.user.id,
        body,
      );
      void this.recordAudit(admin, request, {
        action: 'Cancelled booking',
        actionType: 'update',
        entityId: booking.id,
        details: `Cancelled booking ${booking.bookingReference}.`,
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          reason: body.reason,
        },
      });
      return { data: booking };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/escalate')
  async escalate(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    @Param('bookingId') bookingId: string,
    @Body() body: EscalateAdminBookingRequest,
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (
        !bookingId ||
        !body.reason?.trim() ||
        (body.priority && !validPriorities.has(body.priority))
      ) {
        throw new InvalidAdminRequestError();
      }
      const booking = await this.adminBookingGatewayService.escalateBooking(
        bookingId,
        admin.user.id,
        body,
      );
      void this.recordAudit(admin, request, {
        action: 'Escalated booking',
        actionType: 'update',
        entityId: booking.id,
        details: `Escalated booking ${booking.bookingReference}.`,
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          priority: body.priority ?? 'medium',
          reason: body.reason,
        },
      });
      return { data: booking };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/provider-messages')
  @HttpCode(501)
  async sendProviderMessage(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') _bookingId: string,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return {
      error: {
        code: 'not_implemented',
        message: 'Provider messaging is not yet implemented.',
      },
    };
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
    request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    input: {
      action: string;
      actionType: 'update';
      entityId: string;
      details: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService.createAuditLog({
      adminUserId: admin.user.id,
      adminEmail: admin.user.email,
      adminName: admin.user.fullName,
      action: input.action,
      actionType: input.actionType,
      entityType: 'Booking',
      entityId: input.entityId,
      details: input.details,
      ipAddress: this.getClientIp(request),
      metadata: input.metadata,
    }).catch(() => undefined);
  }

  private getClientIp(request: {
    headers?: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
  }): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? null;
    }

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

    if (error instanceof AdminDependencyUnavailableError) {
      return this.error(
        'admin_dependency_unavailable',
        'Admin service is unavailable.',
        503,
      );
    }

    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
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
