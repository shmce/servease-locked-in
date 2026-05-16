import { Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { AdminDisputeService } from './admin-dispute.service';
import { AdminDisputeSummary } from './admin-dispute.types';

@Controller('internal/admin/disputes')
export class AdminDisputeController {
  constructor(private readonly adminDisputeService: AdminDisputeService) {}

  @Get()
  async list(
    @Query('status') status?: string,
  ): Promise<{ data: AdminDisputeSummary[] }> {
    try {
      return {
        data: await this.adminDisputeService.listDisputes(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin dispute workflow failed.',
        503,
      );
    }
  }

  @Get(':disputeId')
  async show(
    @Param('disputeId') disputeId: string,
  ): Promise<{ data: AdminDisputeSummary }> {
    try {
      return {
        data: await this.adminDisputeService.getDispute(disputeId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin dispute workflow failed.',
        503,
      );
    }
  }

  @Post(':disputeId/resolve')
  async resolve(
    @Param('disputeId') disputeId: string,
  ): Promise<{ data: AdminDisputeSummary }> {
    try {
      return {
        data: await this.adminDisputeService.resolveDispute(disputeId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin dispute workflow failed.',
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
