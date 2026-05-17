import { Injectable } from '@nestjs/common';
import { InvalidBookingTransitionError } from '../booking-lifecycle/booking.errors';
import { BookingStatus } from '../booking-lifecycle/booking.types';
import { InvalidAdminBookingRequestError } from './admin-booking.errors';
import {
  AdminBookingEscalationPriority,
  AdminBookingMessage,
  AdminBookingMessageRole,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AppendAdminBookingMessageInput,
  CancelAdminBookingInput,
  EscalateAdminBookingInput,
  ListAdminBookingsFilter,
} from './admin-booking.types';
import { SupabaseAdminBookingRepository } from './supabase-admin-booking.repository';

const validBookingStatuses = new Set<BookingStatus>([
  'cancelled',
  'completed',
  'confirmed',
  'in_progress',
  'pending',
  'rejected',
]);
const cancellableStatuses = new Set<BookingStatus>([
  'confirmed',
  'in_progress',
  'pending',
]);
const validPriorities = new Set<AdminBookingEscalationPriority>([
  'critical',
  'high',
  'low',
  'medium',
]);

@Injectable()
export class AdminBookingService {
  constructor(
    private readonly bookingRepository: SupabaseAdminBookingRepository,
  ) {}

  getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    return this.bookingRepository.getOperationsAlerts();
  }

  getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    return this.bookingRepository.getBookingsSummary();
  }

  listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    if (
      (filter.status && !validBookingStatuses.has(filter.status)) ||
      (filter.limit !== null &&
        filter.limit !== undefined &&
        (!Number.isInteger(filter.limit) || filter.limit < 1 || filter.limit > 1000))
    ) {
      throw new InvalidAdminBookingRequestError();
    }

    return this.bookingRepository.listBookings({
      ...filter,
      query: filter.query?.trim() || null,
      limit: filter.limit ?? 100,
    });
  }

  getBooking(bookingId: string): Promise<AdminBookingSummary> {
    if (!bookingId) {
      throw new InvalidAdminBookingRequestError();
    }

    return this.bookingRepository.getBooking(bookingId);
  }

  async cancelBooking(
    input: CancelAdminBookingInput,
  ): Promise<AdminBookingSummary> {
    if (!input.bookingId || !input.adminUserId || !input.reason?.trim()) {
      throw new InvalidAdminBookingRequestError();
    }

    const booking = await this.bookingRepository.getBooking(input.bookingId);
    if (!cancellableStatuses.has(booking.status)) {
      throw new InvalidBookingTransitionError();
    }

    return this.bookingRepository.cancelBooking({
      ...input,
      reason: input.reason.trim(),
      explanation: input.explanation?.trim() || null,
    });
  }

  async listBookingMessages(bookingId: string): Promise<AdminBookingMessage[]> {
    if (!bookingId) {
      throw new InvalidAdminBookingRequestError();
    }
    // Validate that booking exists, returns BookingNotFoundError if not.
    await this.bookingRepository.getBooking(bookingId);
    return this.bookingRepository.listMessages(bookingId);
  }

  async appendBookingMessage(
    input: AppendAdminBookingMessageInput,
  ): Promise<AdminBookingMessage> {
    if (
      !input.bookingId ||
      !input.senderUserId ||
      !input.body?.trim() ||
      !(['admin', 'provider', 'customer'] as AdminBookingMessageRole[]).includes(
        input.senderRole,
      )
    ) {
      throw new InvalidAdminBookingRequestError();
    }
    await this.bookingRepository.getBooking(input.bookingId);
    return this.bookingRepository.appendMessage({
      ...input,
      body: input.body.trim(),
      metadata: input.metadata ?? null,
    });
  }

  escalateBooking(
    input: EscalateAdminBookingInput,
  ): Promise<AdminBookingSummary> {
    if (
      !input.bookingId ||
      !input.adminUserId ||
      !input.reason?.trim() ||
      (input.priority && !validPriorities.has(input.priority))
    ) {
      throw new InvalidAdminBookingRequestError();
    }

    return this.bookingRepository.escalateBooking({
      ...input,
      reason: input.reason.trim(),
      priority: input.priority ?? 'medium',
    });
  }
}
