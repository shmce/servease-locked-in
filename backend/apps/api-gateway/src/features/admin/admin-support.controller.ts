import { Body, Controller, Get, Headers, HttpException, Param, Patch, Query } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AdminDependencyUnavailableError,
  AdminRequiredError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminSupportGatewayService } from './admin-support.service';
import { SupportTicketSummary } from './admin-support.types';

const validSupportStatuses = new Set(['open', 'in_progress', 'resolved', 'closed']);

@Controller('v1/admin/support/tickets')
export class AdminSupportController {
  constructor(
    private readonly adminSupportGatewayService: AdminSupportGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
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

  @Patch(':ticketId/status')
  async updateTicketStatus(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      await this.requireAdmin(authorization);
      if (!body.status || !validSupportStatuses.has(body.status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminSupportGatewayService.updateTicketStatus(
          ticketId,
          body.status,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(authorization: string | undefined): Promise<void> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
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
