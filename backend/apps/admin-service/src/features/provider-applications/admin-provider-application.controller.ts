import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { AdminProviderApplicationService } from './admin-provider-application.service';
import {
  AdminProviderApplicationSummary,
  ProviderApplicationStatus,
} from './admin-provider-application.types';

const validStatuses = new Set(['pending', 'approved', 'rejected']);

@Controller('internal/admin/provider-applications')
export class AdminProviderApplicationController {
  constructor(
    private readonly providerApplicationService: AdminProviderApplicationService,
  ) {}

  @Get()
  async list(
    @Query('status') status?: ProviderApplicationStatus,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminProviderApplicationSummary[] }> {
    try {
      if (status && !validStatuses.has(status)) {
        throw new Error('invalid_provider_application_request');
      }
      return {
        data: await this.providerApplicationService.listProviderApplications({
          status: status ?? null,
          query: query ?? null,
          limit: limit ? Number(limit) : 100,
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin provider application workflow failed.',
        503,
      );
    }
  }

  @Get(':applicationId')
  async get(
    @Param('applicationId') applicationId: string,
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    try {
      return {
        data: await this.providerApplicationService.getProviderApplication(
          applicationId,
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin provider application lookup failed.',
        503,
      );
    }
  }

  @Post(':applicationId/approve')
  approve(
    @Param('applicationId') applicationId: string,
    @Body() body: { adminUserId?: string; reason?: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    return this.decide(applicationId, {
      adminUserId: body.adminUserId,
      decision: 'approved',
      reason: body.reason ?? 'Provider application approved.',
    });
  }

  @Post(':applicationId/reject')
  reject(
    @Param('applicationId') applicationId: string,
    @Body() body: { adminUserId?: string; reason?: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    return this.decide(applicationId, {
      adminUserId: body.adminUserId,
      decision: 'rejected',
      reason: body.reason ?? '',
    });
  }

  private async decide(
    applicationId: string,
    input: {
      adminUserId?: string;
      decision: 'approved' | 'rejected';
      reason: string;
    },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    try {
      if (!input.adminUserId || !input.reason.trim()) {
        throw new Error('invalid_provider_application_request');
      }
      return {
        data: await this.providerApplicationService.decideProviderApplication({
          applicationId,
          adminUserId: input.adminUserId,
          decision: input.decision,
          reason: input.reason,
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin provider application decision failed.',
        503,
      );
    }
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
