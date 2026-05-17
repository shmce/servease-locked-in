import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { AdminBookingService } from './admin-booking.service';
import {
  AdminBookingEscalationPriority,
  AdminBookingMessage,
  AdminBookingMessageRole,
  AdminBookingStatus,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
} from './admin-booking.types';

@Controller('internal/admin/bookings')
export class AdminBookingController {
  constructor(private readonly adminBookingService: AdminBookingService) {}

  @Get('operations/alerts')
  async operationsAlerts(): Promise<{ data: AdminOperationsAlerts }> {
    try {
      return {
        data: await this.adminBookingService.getOperationsAlerts(),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Get('summary')
  async summary(): Promise<{ data: AdminBookingsSummaryStats }> {
    try {
      return {
        data: await this.adminBookingService.getBookingsSummary(),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Get()
  async list(
    @Query('status') status?: AdminBookingStatus,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminBookingSummary[] }> {
    try {
      return {
        data: await this.adminBookingService.listBookings({
          status: status ?? null,
          query: query ?? null,
          limit: limit ? Number(limit) : null,
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Get(':bookingId')
  async show(
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      return {
        data: await this.adminBookingService.getBooking(bookingId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Post(':bookingId/cancel')
  async cancel(
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      adminUserId?: string;
      reason?: string;
      explanation?: string | null;
    },
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      return {
        data: await this.adminBookingService.cancelBooking(bookingId, {
          adminUserId: body.adminUserId ?? '',
          reason: body.reason ?? '',
          explanation: body.explanation ?? null,
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Get(':bookingId/messages')
  async listMessages(
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: AdminBookingMessage[] }> {
    try {
      return {
        data: await this.adminBookingService.listMessages(bookingId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Post(':bookingId/messages')
  async appendMessage(
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      senderUserId?: string;
      senderRole?: AdminBookingMessageRole;
      body?: string;
      metadata?: Record<string, unknown> | null;
    },
  ): Promise<{ data: AdminBookingMessage }> {
    try {
      return {
        data: await this.adminBookingService.appendMessage(bookingId, {
          senderUserId: body.senderUserId ?? '',
          senderRole: body.senderRole ?? 'admin',
          body: body.body ?? '',
          metadata: body.metadata ?? null,
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
        503,
      );
    }
  }

  @Post(':bookingId/escalate')
  async escalate(
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      adminUserId?: string;
      reason?: string;
      priority?: AdminBookingEscalationPriority | null;
    },
  ): Promise<{ data: AdminBookingSummary }> {
    try {
      return {
        data: await this.adminBookingService.escalateBooking(bookingId, {
          adminUserId: body.adminUserId ?? '',
          reason: body.reason ?? '',
          priority: body.priority ?? 'medium',
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin booking workflow failed.',
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
