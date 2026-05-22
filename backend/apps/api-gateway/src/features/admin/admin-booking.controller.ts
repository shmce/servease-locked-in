import {
  Body,
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
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
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
import { AdminBookingGatewayService } from './admin-booking.service';
import {
  AdminBookingEscalationPriority,
  AdminBookingMessage,
  AdminBookingMessageRole,
  AdminBookingStatus,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AdminProviderMessageResult,
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
  private readonly logger = new Logger(AdminBookingController.name);

  constructor(
    private readonly adminBookingGatewayService: AdminBookingGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly notificationServiceClient: NotificationServiceClient,
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
          (!Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 200))
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
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
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
      if (booking.customerId) {
        void this.notificationServiceClient
          .createNotification({
            userId: booking.customerId,
            type: 'booking_cancelled_by_admin',
            title: 'Booking cancelled by support',
            body: `Booking ${booking.bookingReference} was cancelled: ${body.reason}`,
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              reason: body.reason,
            },
          })
          .catch((error: unknown) => {
            this.logger.warn(
              `Could not create admin booking cancellation notification for ${booking.id}: ${this.errorMessage(error)}`,
            );
          });
      }
      return { data: booking };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/escalate')
  async escalate(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
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
      void this.catalogServiceClient
        .findProviderOwnerByProviderId(booking.providerId)
        .then((providerOwner) =>
          this.notificationServiceClient.createNotification({
            userId: providerOwner.userId,
            type: 'admin_booking_escalated',
            title: 'Booking escalated by ServEase admin',
            body: `Booking ${booking.bookingReference} was escalated: ${body.reason}`,
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              priority: body.priority ?? 'medium',
              reason: body.reason,
              adminUserId: admin.user.id,
            },
          }),
        )
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not create admin booking escalation notification for ${booking.id}: ${this.errorMessage(error)}`,
          );
        });
      return { data: booking };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/provider-messages')
  async sendProviderMessage(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('bookingId') bookingId: string,
    @Body() body: { message?: string },
  ): Promise<{ data: AdminProviderMessageResult }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const message = body.message?.trim();
      if (!bookingId || !message) {
        throw new InvalidAdminRequestError();
      }

      const booking =
        await this.adminBookingGatewayService.getBooking(bookingId);
      const providerOwner =
        await this.catalogServiceClient.findProviderOwnerByProviderId(
          booking.providerId,
        );

      // Persist the message into the booking thread first so the conversation
      // is preserved even if the notification dispatch fails.
      let persistedMessage: AdminBookingMessage | null = null;
      try {
        persistedMessage = await this.adminBookingGatewayService.appendMessage(
          booking.id,
          {
            senderUserId: admin.user.id,
            senderRole: 'admin',
            body: message,
            metadata: {
              channel: 'provider_message',
              providerId: booking.providerId,
              providerUserId: providerOwner.userId,
            },
          },
        );
      } catch (error) {
        // Persisting must not block the user-visible notification.
        this.logger.warn(
          `Could not persist admin provider message for booking ${booking.id}: ${this.errorMessage(error)}`,
        );
        persistedMessage = null;
      }

      const notification =
        await this.notificationServiceClient.createNotification({
          userId: providerOwner.userId,
          type: 'admin_provider_message',
          title: 'Message from ServEase admin',
          body: message,
          metadata: {
            bookingId: booking.id,
            bookingReference: booking.bookingReference,
            adminUserId: admin.user.id,
            messageId: persistedMessage?.id ?? null,
          },
        });

      void this.recordAudit(admin, request, {
        action: 'Messaged provider',
        actionType: 'update',
        entityId: booking.id,
        details: `Sent provider message for booking ${booking.bookingReference}.`,
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          providerId: booking.providerId,
          notificationId: notification.id,
          messageId: persistedMessage?.id ?? null,
        },
      });

      return {
        data: {
          bookingId: booking.id,
          providerUserId: providerOwner.userId,
          notificationId: notification.id,
          messageId: persistedMessage?.id ?? null,
        },
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/messages')
  async listMessages(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: AdminBookingMessage[] }> {
    try {
      await this.requireAdmin(authorization);
      if (!bookingId) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminBookingGatewayService.listMessages(bookingId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/messages')
  async appendMessage(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      message?: string;
      senderRole?: AdminBookingMessageRole;
      metadata?: Record<string, unknown> | null;
    },
  ): Promise<{ data: AdminBookingMessage }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const text = body.message?.trim();
      if (!bookingId || !text) {
        throw new InvalidAdminRequestError();
      }

      const booking =
        await this.adminBookingGatewayService.getBooking(bookingId);
      const senderRole: AdminBookingMessageRole = body.senderRole ?? 'admin';
      const persisted = await this.adminBookingGatewayService.appendMessage(
        booking.id,
        {
          senderUserId: admin.user.id,
          senderRole,
          body: text,
          metadata: body.metadata ?? null,
        },
      );

      void this.recordAudit(admin, request, {
        action: 'Added booking thread message',
        actionType: 'update',
        entityId: booking.id,
        details: `Added admin booking thread message for ${booking.bookingReference}.`,
        metadata: {
          bookingId: booking.id,
          messageId: persisted.id,
          senderRole,
        },
      });

      return { data: persisted };
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
      actionType: 'update';
      entityId: string;
      details: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<unknown> {
    return this.auditBookingAction({
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
    });
  }

  private async auditBookingAction(
    input: Parameters<AdminAuditGatewayService['createAuditLog']>[0],
  ): Promise<void> {
    try {
      await this.adminAuditGatewayService.createAuditLog(input);
    } catch (error) {
      this.logger.warn(
        `Could not create audit log for admin booking action ${input.action} (${input.entityId}): ${this.errorMessage(error)}`,
      );
    }
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

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
