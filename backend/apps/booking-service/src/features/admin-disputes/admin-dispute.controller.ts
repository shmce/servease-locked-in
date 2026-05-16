import { Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { AdminDisputeService } from './admin-dispute.service';
import { AdminDisputeStatus, AdminDisputeSummary } from './admin-dispute.types';

const validDisputeStatuses = new Set(['open', 'resolved', 'closed']);

@Controller('internal/admin/disputes')
export class AdminDisputeController {
  constructor(private readonly adminDisputeService: AdminDisputeService) {}

  @Get()
  async list(
    @Query('status') status?: string,
  ): Promise<{ data: AdminDisputeSummary[] }> {
    try {
      if (status && !validDisputeStatuses.has(status)) {
        throw this.error(
          'invalid_dispute_request',
          'Dispute request is invalid.',
          400,
        );
      }

      return {
        data: await this.adminDisputeService.listDisputes(
          (status as AdminDisputeStatus | undefined) ?? null,
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.error(
        'booking_dependency_unavailable',
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
      const dispute = await this.adminDisputeService.getDispute(disputeId);
      if (!dispute) {
        throw this.error('dispute_not_found', 'Dispute was not found.', 404);
      }
      return { data: dispute };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.error(
        'booking_dependency_unavailable',
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
      const dispute = await this.adminDisputeService.resolveDispute(disputeId);
      if (!dispute) {
        throw this.error('dispute_not_found', 'Dispute was not found.', 404);
      }
      return { data: dispute };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.error(
        'booking_dependency_unavailable',
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
