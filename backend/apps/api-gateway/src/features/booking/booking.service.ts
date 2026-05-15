import { Injectable } from '@nestjs/common';
import { BookingServiceClient } from './clients/booking-service.client';
import { BookingStatus, BookingSummary, CreateBookingRequest } from './booking.types';

@Injectable()
export class BookingGatewayService {
  constructor(private readonly bookingServiceClient: BookingServiceClient) {}

  createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    return this.bookingServiceClient.createBooking(customerId, input);
  }

  listBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    return this.bookingServiceClient.listBookings(customerId, providerId);
  }

  findBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    return this.bookingServiceClient.findBooking(
      bookingId,
      customerId,
      providerId,
    );
  }

  transitionStatus(
    bookingId: string,
    actorId: string,
    currentStatus: BookingStatus,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    return this.bookingServiceClient.transitionStatus(
      bookingId,
      actorId,
      currentStatus,
      nextStatus,
      reason,
      explanation,
    );
  }
}
