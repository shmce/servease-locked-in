import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AttachmentForbiddenError,
  AttachmentNotFoundError,
  BookingNotFoundError,
  BookingDependencyUnavailableError,
  DisputeForbiddenError,
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
  ProviderProfileRequiredError,
  ProviderUnavailableError,
} from './booking.errors';
import { BookingGatewayService } from './booking.service';
import {
  AddBookingAttachmentRequest,
  BookingAttachmentSummary,
  BookingDisputeSummary,
  BookingServiceUpdateSummary,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  BookingTrackingLocation,
  BookingTrackingSnapshot,
  CreateBookingServiceUpdateRequest,
  CreateBookingRequest,
  RaiseBookingDisputeRequest,
  UpdateBookingLiveLocationRequest,
} from './booking.types';

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

  @Get(':bookingId/tracking')
  async tracking(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: BookingTrackingSnapshot }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.getTrackingSnapshot(
          bookingId,
          userId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Sse(':bookingId/tracking/stream')
  async trackingStream(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<Observable<MessageEvent>> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return this.bookingGatewayService
        .streamTrackingSnapshots(bookingId, userId, providerId)
        .pipe(map((snapshot) => ({ type: 'tracking', data: snapshot })));
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':bookingId/tracking/location')
  async updateTrackingLocation(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Body() body: UpdateBookingLiveLocationRequest,
  ): Promise<{ data: BookingTrackingLocation }> {
    try {
      this.validateLiveLocationRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveRequiredProviderId(userId);
      return {
        data: await this.bookingGatewayService.updateLiveLocation(
          bookingId,
          providerId,
          body,
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
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.transitionStatus(
          bookingId,
          userId,
          providerId,
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
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Body() body: AddBookingAttachmentRequest,
  ): Promise<{ data: BookingAttachmentSummary }> {
    try {
      this.validateAttachmentRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.addAttachment(
          bookingId,
          userId,
          userId,
          providerId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':bookingId/attachments/:attachmentId')
  async deleteAttachment(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<{ data: BookingAttachmentSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.bookingGatewayService.deleteAttachment(
          bookingId,
          attachmentId,
          userId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/disputes')
  async raiseDispute(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Body() body: RaiseBookingDisputeRequest,
  ): Promise<{ data: BookingDisputeSummary }> {
    try {
      this.validateDisputeRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.bookingGatewayService.raiseDispute(
          bookingId,
          userId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/service-updates')
  async listServiceUpdates(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: BookingServiceUpdateSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.listServiceUpdates(
          bookingId,
          userId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':bookingId/timeline')
  async listTimelineEvents(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
  ): Promise<{ data: BookingTimelineEventSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveOptionalProviderId(userId);
      return {
        data: await this.bookingGatewayService.listTimelineEvents(
          bookingId,
          userId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':bookingId/service-updates')
  async createServiceUpdate(
    @Headers('authorization') authorization: string | undefined,
    @Param('bookingId') bookingId: string,
    @Body() body: CreateBookingServiceUpdateRequest,
  ): Promise<{ data: BookingServiceUpdateSummary }> {
    try {
      this.validateServiceUpdateRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      const providerId = await this.resolveRequiredProviderId(userId);
      return {
        data: await this.bookingGatewayService.createServiceUpdate(
          bookingId,
          userId,
          providerId,
          body,
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

    body.attachments?.forEach((attachment) => {
      if (!attachment.fileUrl?.trim()) {
        throw new InvalidBookingRequestError();
      }
    });
  }

  private validateAttachmentRequest(body: AddBookingAttachmentRequest): void {
    if (
      !body.fileUrl?.trim() ||
      !['booking_reference', 'provider_progress'].includes(body.mediaKind)
    ) {
      throw new InvalidBookingRequestError();
    }
  }

  private validateServiceUpdateRequest(
    body: CreateBookingServiceUpdateRequest,
  ): void {
    if (!['checklist', 'progress', 'completion'].includes(body.updateType)) {
      throw new InvalidBookingRequestError();
    }

    if (
      body.updateType !== 'checklist' &&
      !body.message?.trim() &&
      !body.attachmentId
    ) {
      throw new InvalidBookingRequestError();
    }
  }

  private validateDisputeRequest(body: RaiseBookingDisputeRequest): void {
    if (!body.category?.trim() || !body.reason?.trim()) {
      throw new InvalidBookingRequestError();
    }
  }

  private validateLiveLocationRequest(
    body: UpdateBookingLiveLocationRequest,
  ): void {
    if (
      !this.isCoordinate(body.latitude, 90) ||
      !this.isCoordinate(body.longitude, 180) ||
      !this.isOptionalNonNegative(body.accuracyMeters) ||
      !this.isOptionalHeading(body.headingDegrees) ||
      !this.isOptionalNonNegative(body.speedMps)
    ) {
      throw new InvalidBookingRequestError();
    }
  }

  private isCoordinate(value: number | undefined, maxAbsolute: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Math.abs(value) <= maxAbsolute
    );
  }

  private isOptionalNonNegative(value: number | null | undefined): boolean {
    return (
      value === null ||
      value === undefined ||
      (Number.isFinite(value) && value >= 0)
    );
  }

  private isOptionalHeading(value: number | null | undefined): boolean {
    return (
      value === null ||
      value === undefined ||
      (Number.isFinite(value) && value >= 0 && value < 360)
    );
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

    if (error instanceof AttachmentNotFoundError) {
      return this.error(
        'attachment_not_found',
        'Attachment was not found.',
        404,
      );
    }

    if (error instanceof AttachmentForbiddenError) {
      return this.error(
        'attachment_forbidden',
        'You do not have permission to delete this attachment.',
        403,
      );
    }

    if (error instanceof DisputeForbiddenError) {
      return this.error(
        'dispute_forbidden',
        'You do not have permission to raise a dispute on this booking.',
        403,
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
