import { Injectable, Logger, Optional } from '@nestjs/common';
import { BookingAnalyticsPublisher } from './booking-analytics.publisher';
import { InvalidBookingRequestError } from './booking.errors';
import { assertBookingTransition } from './booking-status';
import { SupabaseBookingRepository } from './supabase-booking.repository';
import {
  AddBookingAttachmentInput,
  BookingAttachmentSummary,
  BookingDisputeSummary,
  BookingServiceUpdateSummary,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  BookingTrackingLocation,
  BookingTrackingPhase,
  BookingTrackingSnapshot,
  BookingTrackingTrafficLevel,
  CreateBookingServiceUpdateInput,
  CreateBookingInput,
  RaiseBookingDisputeInput,
  UpdateBookingLiveLocationInput,
} from './booking.types';

@Injectable()
export class BookingLifecycleService {
  private readonly logger = new Logger(BookingLifecycleService.name);

  constructor(
    private readonly bookingRepository: SupabaseBookingRepository,
    @Optional()
    private readonly bookingAnalyticsPublisher?: BookingAnalyticsPublisher,
  ) {}

  createBooking(input: CreateBookingInput): Promise<BookingSummary> {
    return this.bookingRepository.createBooking(input);
  }

  addAttachment(
    input: AddBookingAttachmentInput,
  ): Promise<BookingAttachmentSummary> {
    if (!input.bookingId || !input.actorId || !input.fileUrl.trim()) {
      throw new InvalidBookingRequestError();
    }

    return this.bookingRepository.addAttachment(input);
  }

  deleteAttachment(
    bookingId: string,
    attachmentId: string,
    actorId: string,
  ): Promise<BookingAttachmentSummary> {
    if (!bookingId || !attachmentId || !actorId) {
      throw new InvalidBookingRequestError();
    }
    return this.bookingRepository.deleteAttachment(bookingId, attachmentId, actorId);
  }

  raiseDispute(
    input: RaiseBookingDisputeInput,
  ): Promise<BookingDisputeSummary> {
    if (
      !input.bookingId ||
      !input.actorId ||
      !input.category?.trim() ||
      !input.reason?.trim()
    ) {
      throw new InvalidBookingRequestError();
    }
    return this.bookingRepository.raiseDispute({
      ...input,
      category: input.category.trim(),
      reason: input.reason.trim(),
      description: input.description?.trim() ?? null,
    });
  }

  listMyDisputes(actorId: string): Promise<BookingDisputeSummary[]> {
    if (!actorId) {
      throw new InvalidBookingRequestError();
    }
    return this.bookingRepository.listMyDisputes(actorId);
  }

  createServiceUpdate(
    input: CreateBookingServiceUpdateInput,
  ): Promise<BookingServiceUpdateSummary> {
    if (
      !input.bookingId ||
      !input.actorId ||
      !input.providerId ||
      !['checklist', 'progress', 'completion'].includes(input.updateType)
    ) {
      throw new InvalidBookingRequestError();
    }

    return this.bookingRepository.createServiceUpdate(input);
  }

  listServiceUpdates(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingServiceUpdateSummary[]> {
    if (!bookingId || (!customerId && !providerId)) {
      throw new InvalidBookingRequestError();
    }

    return this.bookingRepository.listServiceUpdates(
      bookingId,
      customerId,
      providerId,
    );
  }

  listTimelineEvents(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTimelineEventSummary[]> {
    if (!bookingId || (!customerId && !providerId)) {
      throw new InvalidBookingRequestError();
    }

    return this.bookingRepository.listTimelineEvents(
      bookingId,
      customerId,
      providerId,
    );
  }

  listBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    return this.bookingRepository.listVisibleBookings(customerId, providerId);
  }

  findBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    return this.bookingRepository.findVisibleBooking(
      bookingId,
      customerId,
      providerId,
    );
  }

  async getTrackingSnapshot(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTrackingSnapshot> {
    if (!bookingId || (!customerId && !providerId)) {
      throw new InvalidBookingRequestError();
    }

    const booking = await this.bookingRepository.findVisibleBooking(
      bookingId,
      customerId,
      providerId,
    );
    const seed = this.hashRouteSeed(
      `${booking.id}:${booking.serviceAddress ?? ''}:${booking.scheduledAt}`,
    );
    const distanceKm = this.deriveDistanceKm(booking.status, seed);
    const etaMinutes = this.deriveEtaMinutes(
      booking.status,
      booking.scheduledAt,
      distanceKm,
      seed,
    );
    const providerLocation = await this.bookingRepository.getLiveLocation(
      bookingId,
      customerId,
      providerId,
    );

    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: booking.status,
      phase: this.trackingPhaseForStatus(booking.status),
      etaMinutes,
      distanceKm,
      trafficLevel:
        distanceKm === null ? null : this.trackingTrafficForSeed(seed),
      destinationAddress: booking.serviceAddress,
      destinationLocation: null,
      providerLocation,
      scheduledAt: booking.scheduledAt,
      lastUpdatedAt: providerLocation?.updatedAt ?? new Date().toISOString(),
    };
  }

  updateLiveLocation(
    input: UpdateBookingLiveLocationInput,
  ): Promise<BookingTrackingLocation> {
    if (
      !input.bookingId ||
      !input.providerId ||
      !this.isCoordinate(input.latitude, 90) ||
      !this.isCoordinate(input.longitude, 180) ||
      !this.isOptionalNonNegative(input.accuracyMeters) ||
      !this.isOptionalHeading(input.headingDegrees) ||
      !this.isOptionalNonNegative(input.speedMps)
    ) {
      throw new InvalidBookingRequestError();
    }

    return this.bookingRepository.upsertLiveLocation({
      ...input,
      accuracyMeters: input.accuracyMeters ?? null,
      headingDegrees: input.headingDegrees ?? null,
      speedMps: input.speedMps ?? null,
    });
  }

  async transitionStatus(
    bookingId: string,
    actorId: string,
    currentStatus: BookingStatus,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    assertBookingTransition(currentStatus, nextStatus);
    const booking = await this.bookingRepository.transitionStatus(
      bookingId,
      actorId,
      nextStatus,
      reason,
      explanation,
    );

    if (nextStatus === 'completed') {
      await this.publishBookingCompletedSafely(booking);
    }

    return booking;
  }

  private async publishBookingCompletedSafely(
    booking: BookingSummary,
  ): Promise<void> {
    if (!this.bookingAnalyticsPublisher) {
      return;
    }

    try {
      await this.bookingAnalyticsPublisher.publishBookingCompleted(booking);
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'booking_completed_analytics_publish_failed',
          bookingId: booking.id,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  private deriveDistanceKm(status: BookingStatus, seed: number): number | null {
    if (!['confirmed', 'in_progress'].includes(status)) {
      return null;
    }

    return Number((2.5 + (seed % 66) / 10).toFixed(1));
  }

  private deriveEtaMinutes(
    status: BookingStatus,
    scheduledAt: string,
    distanceKm: number | null,
    seed: number,
  ): number | null {
    if (status === 'confirmed') {
      const minutesUntilSchedule = Math.ceil(
        (new Date(scheduledAt).getTime() - Date.now()) / 60000,
      );
      return this.clamp(minutesUntilSchedule, 15, 90);
    }

    if (status === 'in_progress' && distanceKm !== null) {
      return this.clamp(Math.ceil(distanceKm * 4 + (seed % 8)), 8, 45);
    }

    return null;
  }

  private trackingPhaseForStatus(status: BookingStatus): BookingTrackingPhase {
    switch (status) {
      case 'pending':
        return 'awaiting_confirmation';
      case 'confirmed':
        return 'scheduled';
      case 'in_progress':
        return 'on_the_way';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      case 'rejected':
        return 'rejected';
    }
  }

  private trackingTrafficForSeed(seed: number): BookingTrackingTrafficLevel {
    return (['light', 'moderate', 'heavy'] as const)[seed % 3];
  }

  private hashRouteSeed(value: string): number {
    return value.split('').reduce((total, character) => {
      return (total + character.charCodeAt(0)) % 9973;
    }, 0);
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    if (!Number.isFinite(value)) {
      return minimum;
    }

    return Math.min(Math.max(value, minimum), maximum);
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
}
