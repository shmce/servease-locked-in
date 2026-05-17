import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { InvalidAdminBroadcastRequestError } from './admin-broadcast.errors';
import { AdminBroadcastService } from './admin-broadcast.service';
import {
  AdminBroadcastAudience,
  AdminBroadcastRepeatRule,
  AdminBroadcastStatus,
  AdminBroadcastSummary,
  CreateAdminBroadcastInput,
} from './admin-broadcast.types';

@Controller('internal/admin/broadcasts')
export class AdminBroadcastController {
  constructor(private readonly adminBroadcastService: AdminBroadcastService) {}

  @Get()
  async list(
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminBroadcastSummary[] }> {
    try {
      return {
        data: await this.adminBroadcastService.listBroadcasts(
          limit ? Number(limit) : null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      adminUserId?: string;
      audience?: AdminBroadcastAudience;
      audienceCohort?: string | null;
      title?: string;
      message?: string;
      status?: AdminBroadcastStatus;
      scheduledAt?: string | null;
      repeatRule?: AdminBroadcastRepeatRule | null;
      deliveredCount?: number | null;
      failedCount?: number | null;
    },
  ): Promise<{ data: AdminBroadcastSummary }> {
    try {
      return {
        data: await this.adminBroadcastService.createBroadcast({
          adminUserId: body.adminUserId ?? '',
          audience: body.audience ?? 'all',
          audienceCohort: body.audienceCohort ?? null,
          title: body.title ?? '',
          message: body.message ?? '',
          status: body.status ?? 'sent',
          scheduledAt: body.scheduledAt ?? null,
          repeatRule: body.repeatRule ?? 'none',
          deliveredCount: body.deliveredCount ?? 0,
          failedCount: body.failedCount ?? 0,
        } satisfies CreateAdminBroadcastInput),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAdminBroadcastRequestError) {
      return this.error(
        'invalid_admin_broadcast_request',
        'Broadcast request is invalid.',
        400,
      );
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin broadcast workflow failed.',
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
