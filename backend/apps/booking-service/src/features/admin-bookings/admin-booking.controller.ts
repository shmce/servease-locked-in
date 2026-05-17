import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
} from '../booking-lifecycle/booking.errors';
import { BookingStatus } from '../booking-lifecycle/booking.types';
import { InvalidAdminBookingRequestError } from './admin-booking.errors';
import { AdminBookingService } from './admin-booking.service';
import {
  AdminBookingEscalationPriority,
  AdminBookingMessage,
  AdminBookingMessageRole,
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
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('summary')
  async summary(): Promise<{ data: AdminBookingsSummaryStats }> {
    try {
      return {
        data: await this.adminBookingService.getBookingsSummary(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get()
  async list(
    @Query('status') status?: BookingStatus,
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
    } catch (error) {
      throw this.toHttpException(error);
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
    } catch (error) {
      throw this.toHttpException(error);
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
        data: await this.adminBookingService.cancelBooking({
          bookingId,
          adminUserId: body.adminUserId ?? '',
          reason: body.reason ?? '',
          explanation: body.explanation ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/messages')
  async listMessages(
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: AdminBookingMessage[] }> {
    try {
      return {
        data: await this.adminBookingService.listBookingMessages(bookingId),
      };
    } catch (error) {
      throw this.toHttpException(error);
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
        data: await this.adminBookingService.appendBookingMessage({
          bookingId,
          senderUserId: body.senderUserId ?? '',
          senderRole: body.senderRole ?? 'admin',
          body: body.body ?? '',
          metadata: body.metadata ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
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
        data: await this.adminBookingService.escalateBooking({
          bookingId,
          adminUserId: body.adminUserId ?? '',
          reason: body.reason ?? '',
          priority: body.priority ?? 'medium',
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAdminBookingRequestError) {
      return this.error('invalid_admin_request', 'Admin booking request is invalid.', 400);
    }

    if (error instanceof BookingNotFoundError) {
      return this.error('booking_not_found', 'Booking was not found.', 404);
    }

    if (error instanceof InvalidBookingTransitionError) {
      return this.error(
        'invalid_booking_transition',
        'Booking status transition is invalid.',
        409,
      );
    }

    console.error('[admin-booking] unexpected error:', error);
    return this.error(
      'admin_dependency_unavailable',
      'Admin booking workflow failed.',
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
