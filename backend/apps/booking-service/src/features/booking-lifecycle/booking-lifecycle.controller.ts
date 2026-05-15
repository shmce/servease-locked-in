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
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from './booking.errors';
import { BookingLifecycleService } from './booking-lifecycle.service';
import {
  AddBookingAttachmentInput,
  BookingAttachmentSummary,
  BookingServiceUpdateSummary,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  CreateBookingServiceUpdateInput,
  CreateBookingInput,
} from './booking.types';

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

  @Post(':bookingId/attachments')
  async addAttachment(
    @Param('bookingId') bookingId: string,
    @Body() body: Omit<AddBookingAttachmentInput, 'bookingId'>,
  ): Promise<{ data: BookingAttachmentSummary }> {
    try {
      return {
        data: await this.bookingLifecycleService.addAttachment({
          ...body,
          bookingId,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/service-updates')
  async listServiceUpdates(
    @Param('bookingId') bookingId: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: BookingServiceUpdateSummary[] }> {
    try {
      return {
        data: await this.bookingLifecycleService.listServiceUpdates(
          bookingId,
          customerId ?? null,
          providerId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/timeline')
  async listTimelineEvents(
    @Param('bookingId') bookingId: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: BookingTimelineEventSummary[] }> {
    try {
      return {
        data: await this.bookingLifecycleService.listTimelineEvents(
          bookingId,
          customerId ?? null,
          providerId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/service-updates')
  async createServiceUpdate(
    @Param('bookingId') bookingId: string,
    @Body() body: Omit<CreateBookingServiceUpdateInput, 'bookingId'>,
  ): Promise<{ data: BookingServiceUpdateSummary }> {
    try {
      return {
        data: await this.bookingLifecycleService.createServiceUpdate({
          ...body,
          bookingId,
        }),
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

    if (error instanceof InvalidBookingRequestError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_booking_request',
            message: 'Booking request is invalid.',
            details: {},
          },
        },
        400,
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
