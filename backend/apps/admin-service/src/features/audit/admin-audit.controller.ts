import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { InvalidAdminAuditRequestError } from './admin-audit.errors';
import {
  AdminAuditActionType,
  AdminAuditLogSummary,
  CreateAdminAuditLogInput,
} from './admin-audit.types';

@Controller('internal/admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get()
  async list(
    @Query('adminUserId') adminUserId?: string,
    @Query('actionType') actionType?: AdminAuditActionType,
    @Query('entityType') entityType?: string,
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminAuditLogSummary[] }> {
    try {
      return {
        data: await this.adminAuditService.listAuditLogs({
          adminUserId: adminUserId ?? null,
          actionType: actionType ?? null,
          entityType: entityType ?? null,
          query: query ?? null,
          from: from ?? null,
          to: to ?? null,
          limit: limit ? Number(limit) : null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Body() body: CreateAdminAuditLogInput,
  ): Promise<{ data: AdminAuditLogSummary }> {
    try {
      return {
        data: await this.adminAuditService.createAuditLog(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAdminAuditRequestError) {
      return this.error('invalid_admin_audit_request', 'Audit request is invalid.', 400);
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin audit workflow failed.',
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
