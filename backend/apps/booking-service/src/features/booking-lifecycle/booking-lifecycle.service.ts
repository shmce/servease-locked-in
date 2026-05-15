import { Injectable } from '@nestjs/common';
import { assertBookingTransition } from './booking-status';
import { SupabaseBookingRepository } from './supabase-booking.repository';
import {
  BookingStatus,
  BookingSummary,
  CreateBookingInput,
} from './booking.types';

@Injectable()
export class BookingLifecycleService {
  constructor(private readonly bookingRepository: SupabaseBookingRepository) {}

  createBooking(input: CreateBookingInput): Promise<BookingSummary> {
    return this.bookingRepository.createBooking(input);
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
