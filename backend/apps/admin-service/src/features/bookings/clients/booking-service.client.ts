import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminBookingMessage,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AppendAdminBookingMessageRequest,
  CancelAdminBookingRequest,
  EscalateAdminBookingRequest,
  ListAdminBookingsFilter,
} from '../admin-booking.types';

@Injectable()
export class BookingServiceClient {
  constructor(private readonly configService: ConfigService) {}

  getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    return this.request<AdminOperationsAlerts>(
      '/internal/admin/bookings/operations/alerts',
      'GET',
    );
  }

  getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    return this.request<AdminBookingsSummaryStats>(
      '/internal/admin/bookings/summary',
      'GET',
    );
  }

  listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    const searchParams = new URLSearchParams();
    if (filter.status) {
      searchParams.set('status', filter.status);
    }
    if (filter.query) {
      searchParams.set('query', filter.query);
    }
    if (filter.limit) {
      searchParams.set('limit', String(filter.limit));
    }

    return this.request<AdminBookingSummary[]>(
      `/internal/admin/bookings?${searchParams.toString()}`,
      'GET',
    );
  }

  getBooking(bookingId: string): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}`,
      'GET',
    );
  }

  cancelBooking(
    bookingId: string,
    input: CancelAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}/cancel`,
      'POST',
      input,
    );
  }

  escalateBooking(
    bookingId: string,
    input: EscalateAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}/escalate`,
      'POST',
      input,
    );
  }

  listMessages(bookingId: string): Promise<AdminBookingMessage[]> {
    return this.request<AdminBookingMessage[]>(
      `/internal/admin/bookings/${bookingId}/messages`,
      'GET',
    );
  }

  appendMessage(
    bookingId: string,
    input: AppendAdminBookingMessageRequest,
  ): Promise<AdminBookingMessage> {
    return this.request<AdminBookingMessage>(
      `/internal/admin/bookings/${bookingId}/messages`,
      'POST',
      input,
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'BOOKING_SERVICE_URL',
      'http://localhost:8504',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('booking_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
