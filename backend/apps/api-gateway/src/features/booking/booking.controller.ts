import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  BookingNotFoundError,
  BookingDependencyUnavailableError,
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
  ProviderProfileRequiredError,
  ProviderUnavailableError,
} from './booking.errors';
import { BookingGatewayService } from './booking.service';
import { BookingStatus, BookingSummary, CreateBookingRequest } from './booking.types';

@Controller('v1/bookings')
export class BookingController {
  constructor(
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('scope') scope?: 'customer' | 'provider',
  ): Promise<{ data: BookingSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId =
        scope === 'provider' ? await this.resolveRequiredProviderId(userId) : null;
      return {
        data: await this.bookingGatewayService.listBookings(
          scope === 'provider' ? null : userId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId')
  async show(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: BookingSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.findBooking(
          bookingId,
          userId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateBookingRequest,
  ): Promise<{ data: BookingSummary }> {
    try {
      this.validateCreateRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.bookingGatewayService.createBooking(userId, body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':bookingId/status')
  async transition(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      currentStatus: BookingStatus;
      nextStatus: BookingStatus;
      reason?: string | null;
      explanation?: string | null;
    },
  ): Promise<{ data: BookingSummary }> {
    try {
      if (!body.currentStatus || !body.nextStatus) {
        throw new InvalidBookingRequestError();
      }
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.bookingGatewayService.transitionStatus(
          bookingId,
          userId,
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

  private validateCreateRequest(body: CreateBookingRequest): void {
    if (!body.providerId || !body.serviceAddress || !body.scheduledAt) {
      throw new InvalidBookingRequestError();
    }
  }

  private async resolveRequiredProviderId(userId: string): Promise<string> {
    const providerProfile =
      await this.catalogServiceClient.findProviderProfileByUserId(userId);

    if (!providerProfile) {
      throw new ProviderProfileRequiredError();
    }

    return providerProfile.id;
  }

  private async resolveOptionalProviderId(userId: string): Promise<string | null> {
    const providerProfile =
      await this.catalogServiceClient.findProviderProfileByUserId(userId);
    return providerProfile?.id ?? null;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidBookingRequestError) {
      return this.error('invalid_booking_request', 'Booking request is invalid.', 400);
    }

    if (error instanceof InvalidBookingTransitionError) {
      return this.error(
        'invalid_booking_transition',
        'Booking status transition is invalid.',
        409,
      );
    }

    if (error instanceof BookingNotFoundError) {
      return this.error('booking_not_found', 'Booking was not found.', 404);
    }

    if (error instanceof ProviderUnavailableError) {
      return this.error(
        'provider_unavailable',
        'Provider is unavailable for the requested time.',
        409,
      );
    }

    if (error instanceof ProviderProfileRequiredError) {
      return this.error(
        'provider_profile_required',
        'A provider profile is required.',
        403,
      );
    }

    if (error instanceof BookingDependencyUnavailableError) {
      return this.error(
        'booking_dependency_unavailable',
        'Booking service is unavailable.',
        503,
      );
    }

    return this.error('booking_dependency_unavailable', 'Booking failed.', 503);
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
