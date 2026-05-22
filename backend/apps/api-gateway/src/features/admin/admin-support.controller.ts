import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Optional,
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
import { AdminSupportGatewayService } from './admin-support.service';
import {
  SupportTicketReplySummary,
  SupportTicketSummary,
} from './admin-support.types';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';

const validSupportStatuses = new Set([
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

@Controller('v1/admin/support/tickets')
export class AdminSupportController {
  private readonly logger = new Logger(AdminSupportController.name);

  constructor(
    private readonly adminSupportGatewayService: AdminSupportGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    @Optional()
    private readonly notificationServiceClient?: NotificationServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: string,
  ): Promise<{ data: SupportTicketSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validSupportStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminSupportGatewayService.listSupportTickets(
          status ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':ticketId')
  async get(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminSupportGatewayService.getSupportTicket(ticketId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':ticketId/replies')
  async listReplies(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
  ): Promise<{ data: SupportTicketReplySummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminSupportGatewayService.listReplies(ticketId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':ticketId/replies')
  async addReply(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
    @Body() body: { repliedBy?: string; message?: string },
  ): Promise<{ data: SupportTicketReplySummary }> {
    try {
      await this.requireAdmin(authorization);
      if (!body.repliedBy?.trim() || !body.message?.trim()) {
        throw new InvalidAdminRequestError();
      }
      const reply = await this.adminSupportGatewayService.addReply(
        ticketId,
        body.repliedBy,
        body.message,
      );
      if (this.notificationServiceClient) {
        const ticket = await this.adminSupportGatewayService
          .getSupportTicket(ticketId)
          .catch((error: unknown) => {
            this.logger.warn(
              `Could not load support ticket ${ticketId} before sending reply notification: ${this.errorMessage(error)}`,
            );
            return null;
          });
        if (ticket?.userId) {
          void this.notificationServiceClient
            .createNotification({
              userId: ticket.userId,
              type: 'support_reply',
              title: 'Support team replied',
              body: body.message.slice(0, 160),
              metadata: {
                ticketId,
                replyId: reply.id,
                subject: ticket.subject ?? null,
              },
            })
            .catch((error: unknown) => {
              this.logger.warn(
                `Could not create support reply notification for ticket ${ticketId}: ${this.errorMessage(error)}`,
              );
            });
        }
      }
      return { data: reply };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':ticketId/assignee')
  async assignTicket(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
    @Body() body: { assigneeId?: string | null },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminSupportGatewayService.assignTicket(
          ticketId,
          body.assigneeId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':ticketId/status')
  async updateTicketStatus(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('ticketId') ticketId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.status || !validSupportStatuses.has(body.status)) {
        throw new InvalidAdminRequestError();
      }
      const ticket = await this.adminSupportGatewayService.updateTicketStatus(
        ticketId,
        body.status,
      );
      void this.adminAuditGatewayService
        .createAuditLog({
          adminUserId: admin.user.id,
          adminEmail: admin.user.email,
          adminName: admin.user.fullName,
          action: `Updated support ticket status to ${ticket.status}`,
          actionType: ticket.status === 'resolved' ? 'resolve' : 'update',
          entityType: 'Support Ticket',
          entityId: ticket.id,
          details: `Support ticket ${ticket.id} is now ${ticket.status}.`,
          ipAddress: this.getClientIp(request),
          metadata: { ticketId: ticket.id, status: ticket.status },
        })
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not create audit log for support ticket ${ticket.id} status update: ${this.errorMessage(error)}`,
          );
        });
      if (this.notificationServiceClient && ticket.userId) {
        void this.notificationServiceClient
          .createNotification({
            userId: ticket.userId,
            type: `support_ticket_${ticket.status}`,
            title:
              ticket.status === 'resolved'
                ? 'Your support ticket was resolved'
                : ticket.status === 'closed'
                  ? 'Your support ticket was closed'
                  : 'Support ticket update',
            body:
              ticket.status === 'resolved'
                ? 'Thanks for your patience — the support team marked your ticket as resolved.'
                : ticket.status === 'closed'
                  ? 'Your ticket was closed. Open a new one if you still need help.'
                  : `Status updated to ${ticket.status.replace('_', ' ')}.`,
            metadata: {
              ticketId: ticket.id,
              status: ticket.status,
              subject: ticket.subject ?? null,
            },
          })
          .catch((error: unknown) => {
            this.logger.warn(
              `Could not create support status notification for ticket ${ticket.id}: ${this.errorMessage(error)}`,
            );
          });
      }
      return {
        data: ticket,
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
