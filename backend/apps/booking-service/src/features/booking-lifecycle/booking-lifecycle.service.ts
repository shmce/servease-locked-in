import { Injectable } from '@nestjs/common';
import { InvalidBookingRequestError } from './booking.errors';
import { assertBookingTransition } from './booking-status';
import { SupabaseBookingRepository } from './supabase-booking.repository';
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

@Injectable()
export class BookingLifecycleService {
  constructor(private readonly bookingRepository: SupabaseBookingRepository) {}

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

  async transitionStatus(
    bookingId: string,
    actorId: string,
    currentStatus: BookingStatus,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    assertBookingTransition(currentStatus, nextStatus);
    return this.bookingRepository.transitionStatus(
      bookingId,
      actorId,
      nextStatus,
      reason,
      explanation,
    );
  }
}
