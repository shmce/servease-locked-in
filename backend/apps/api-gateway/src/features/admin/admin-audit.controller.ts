import {
  Controller,
  Get,
  Headers,
  HttpException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
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
import { AdminAuditGatewayService } from './admin-audit.service';
import {
  AdminAuditActionType,
  AdminAuditLogSummary,
  ListAdminAuditLogsFilter,
} from './admin-audit.types';

interface RequestWithHeaders {
  headers?: Record<string, string | string[] | undefined>;
  socket?: {
    remoteAddress?: string;
  };
}

const validActionTypes = new Set<AdminAuditActionType>([
  'approve',
  'create',
  'delete',
  'export',
  'login',
  'other',
  'reject',
  'resolve',
  'update',
]);

@Controller('v1/admin/audit-logs')
export class AdminAuditController {
  constructor(
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('adminUserId') adminUserId?: string,
    @Query('actionType') actionType?: AdminAuditActionType,
    @Query('entityType') entityType?: string,
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminAuditLogSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      const filter = this.parseFilter({
        adminUserId,
        actionType,
        entityType,
        query,
        from,
        to,
        limit,
      });

      return {
        data: await this.adminAuditGatewayService.listAuditLogs(filter),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('export')
  async export(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: RequestWithHeaders,
    @Res() response: Response,
    @Query('adminUserId') adminUserId?: string,
    @Query('actionType') actionType?: AdminAuditActionType,
    @Query('entityType') entityType?: string,
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ): Promise<void> {
    try {
      const admin = await this.requireAdmin(authorization);
      const filter = this.parseFilter({
        adminUserId,
        actionType,
        entityType,
        query,
        from,
        to,
        limit,
      });
      const logs = await this.adminAuditGatewayService.listAuditLogs(filter);

      void this.adminAuditGatewayService.createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Exported audit logs',
        actionType: 'export',
        entityType: 'Audit Log',
        entityId: null,
        details: `Exported ${logs.length} audit log rows.`,
        ipAddress: this.getClientIp(request),
        metadata: { rowCount: logs.length },
      });

      response.setHeader('content-type', 'text/csv; charset=utf-8');
      response.setHeader(
        'content-disposition',
        'attachment; filename="servease-admin-audit-logs.csv"',
      );
      response.status(200).send(this.toCsv(logs));
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(authorization: string | undefined): Promise<{
    user: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
    };
  }> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }

    return currentUser;
  }

  private parseFilter(input: {
    adminUserId?: string;
    actionType?: AdminAuditActionType;
    entityType?: string;
    query?: string;
    from?: string;
    to?: string;
    limit?: string;
  }): ListAdminAuditLogsFilter {
    const limit = input.limit ? Number(input.limit) : null;

    if (
      (input.actionType && !validActionTypes.has(input.actionType)) ||
      (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 500))
    ) {
      throw new InvalidAdminRequestError();
    }

    return {
      adminUserId: input.adminUserId ?? null,
      actionType: input.actionType ?? null,
      entityType: input.entityType ?? null,
      query: input.query ?? null,
      from: input.from ?? null,
      to: input.to ?? null,
      limit,
    };
  }

  private toCsv(logs: AdminAuditLogSummary[]): string {
    const rows = [
      [
        'id',
        'createdAt',
        'adminUserId',
        'adminEmail',
        'adminName',
        'action',
        'actionType',
        'entityType',
        'entityId',
        'details',
        'ipAddress',
      ],
      ...logs.map((log) => [
        log.id,
        log.createdAt ?? '',
        log.adminUserId,
        log.adminEmail ?? '',
        log.adminName ?? '',
        log.action,
        log.actionType,
        log.entityType,
        log.entityId ?? '',
        log.details ?? '',
        log.ipAddress ?? '',
      ]),
    ];

    return rows
      .map((row) => row.map((value) => this.csvCell(value)).join(','))
      .join('\n');
  }

  private csvCell(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private getClientIp(request: RequestWithHeaders): string | null {
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
