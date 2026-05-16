import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingDependencyUnavailableError,
  BookingNotFoundError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from '../booking.errors';
import {
  AddBookingAttachmentRequest,
  BookingAttachmentSummary,
  BookingServiceUpdateSummary,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  BookingTrackingSnapshot,
  CreateBookingServiceUpdateRequest,
  CreateBookingRequest,
} from '../booking.types';

@Injectable()
export class BookingServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    return this.request<BookingSummary>('/internal/bookings', 'POST', {
      customerId,
      ...input,
    });
  }

  async listBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    const searchParams = new URLSearchParams();
    if (customerId) {
      searchParams.set('customerId', customerId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    return this.request<BookingSummary[]>(
      `/internal/bookings?${searchParams.toString()}`,
      'GET',
    );
  }

  async findBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    const searchParams = new URLSearchParams();
    if (customerId) {
      searchParams.set('customerId', customerId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    return this.request<BookingSummary>(
      `/internal/bookings/${bookingId}?${searchParams.toString()}`,
      'GET',
    );
  }

  async getTrackingSnapshot(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTrackingSnapshot> {
    const searchParams = new URLSearchParams();
    if (customerId) {
      searchParams.set('customerId', customerId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    return this.request<BookingTrackingSnapshot>(
      `/internal/bookings/${bookingId}/tracking?${searchParams.toString()}`,
      'GET',
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
    return this.request<BookingSummary>(
      `/internal/bookings/${bookingId}/status`,
      'PATCH',
      {
        actorId,
        currentStatus,
        nextStatus,
        reason,
        explanation,
      },
    );
  }

  async addAttachment(
    bookingId: string,
    input: AddBookingAttachmentRequest & {
      actorId: string;
      customerId?: string | null;
      providerId?: string | null;
    },
  ): Promise<BookingAttachmentSummary> {
    return this.request<BookingAttachmentSummary>(
      `/internal/bookings/${bookingId}/attachments`,
      'POST',
      input,
    );
  }

  async listServiceUpdates(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingServiceUpdateSummary[]> {
    const searchParams = new URLSearchParams();
    if (customerId) {
      searchParams.set('customerId', customerId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    return this.request<BookingServiceUpdateSummary[]>(
      `/internal/bookings/${bookingId}/service-updates?${searchParams.toString()}`,
      'GET',
    );
  }

  async listTimelineEvents(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTimelineEventSummary[]> {
    const searchParams = new URLSearchParams();
    if (customerId) {
      searchParams.set('customerId', customerId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    return this.request<BookingTimelineEventSummary[]>(
      `/internal/bookings/${bookingId}/timeline?${searchParams.toString()}`,
      'GET',
    );
  }

  async createServiceUpdate(
    bookingId: string,
    input: CreateBookingServiceUpdateRequest & {
      actorId: string;
      providerId: string;
    },
  ): Promise<BookingServiceUpdateSummary> {
    return this.request<BookingServiceUpdateSummary>(
      `/internal/bookings/${bookingId}/service-updates`,
      'POST',
      input,
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
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
      const code = await this.readErrorCode(response);
      if (code === 'invalid_booking_transition') {
        throw new InvalidBookingTransitionError();
      }
      if (code === 'booking_not_found') {
        throw new BookingNotFoundError();
      }
      if (code === 'provider_unavailable') {
        throw new ProviderUnavailableError();
      }
      throw new BookingDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
