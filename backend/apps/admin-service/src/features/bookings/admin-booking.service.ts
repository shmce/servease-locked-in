import { Injectable } from '@nestjs/common';
import {
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  CancelAdminBookingRequest,
  EscalateAdminBookingRequest,
  ListAdminBookingsFilter,
} from './admin-booking.types';
import { BookingServiceClient } from './clients/booking-service.client';

@Injectable()
export class AdminBookingService {
  constructor(private readonly bookingServiceClient: BookingServiceClient) {}

  getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    return this.bookingServiceClient.getOperationsAlerts();
  }

  getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    return this.bookingServiceClient.getBookingsSummary();
  }

  listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    return this.bookingServiceClient.listBookings(filter);
  }

  getBooking(bookingId: string): Promise<AdminBookingSummary> {
    return this.bookingServiceClient.getBooking(bookingId);
  }

  cancelBooking(
    bookingId: string,
    input: CancelAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.bookingServiceClient.cancelBooking(bookingId, input);
  }

  escalateBooking(
    bookingId: string,
    input: EscalateAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.bookingServiceClient.escalateBooking(bookingId, input);
  }
}
