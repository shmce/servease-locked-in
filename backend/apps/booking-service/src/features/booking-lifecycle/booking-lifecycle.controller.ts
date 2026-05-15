import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from './booking.errors';
import { BookingLifecycleService } from './booking-lifecycle.service';
import { BookingStatus, BookingSummary, CreateBookingInput } from './booking.types';

@Controller('internal/bookings')
export class BookingLifecycleController {
  constructor(private readonly bookingLifecycleService: BookingLifecycleService) {}

  @Post()
  async create(@Body() body: CreateBookingInput): Promise<{ data: BookingSummary }> {
    try {
      return {
        data: await this.bookingLifecycleService.createBooking(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get()
  async list(
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: BookingSummary[] }> {
    try {
      return {
        data: await this.bookingLifecycleService.listBookings(
          customerId ?? null,
          providerId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId')
  async show(
    @Param('bookingId') bookingId: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: BookingSummary }> {
    try {
      return {
        data: await this.bookingLifecycleService.findBooking(
          bookingId,
          customerId ?? null,
          providerId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':bookingId/status')
  async transition(
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      actorId: string;
      currentStatus: BookingStatus;
      nextStatus: BookingStatus;
      reason?: string | null;
      explanation?: string | null;
    },
  ): Promise<{ data: BookingSummary }> {
    try {
      return {
        data: await this.bookingLifecycleService.transitionStatus(
          bookingId,
          body.actorId,
          body.currentStatus,
          body.nextStatus,
          body.reason,
          body.explanation,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidBookingTransitionError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_booking_transition',
            message: 'Booking status transition is invalid.',
            details: {},
          },
        },
        409,
      );
    }

    if (error instanceof BookingNotFoundError) {
      return new HttpException(
        {
          error: {
            code: 'booking_not_found',
            message: 'Booking was not found.',
            details: {},
          },
        },
        404,
      );
    }

    if (error instanceof ProviderUnavailableError) {
      return new HttpException(
        {
          error: {
            code: 'provider_unavailable',
            message: 'Provider is unavailable for the requested time.',
            details: {},
          },
        },
        409,
      );
    }

    return new HttpException(
      {
        error: {
          code: 'booking_dependency_unavailable',
          message: 'Booking service failed.',
          details: {},
        },
      },
      503,
    );
  }
}
