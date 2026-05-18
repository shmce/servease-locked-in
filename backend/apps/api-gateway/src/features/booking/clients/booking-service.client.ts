import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttachmentForbiddenError,
  AttachmentNotFoundError,
  BookingDependencyUnavailableError,
  BookingNotFoundError,
  DisputeForbiddenError,
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from '../booking.errors';
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

  async updateLiveLocation(
    bookingId: string,
    providerId: string,
    input: UpdateBookingLiveLocationRequest,
  ): Promise<BookingTrackingLocation> {
    return this.request<BookingTrackingLocation>(
      `/internal/bookings/${bookingId}/tracking/location`,
      'PATCH',
      {
        providerId,
        ...input,
      },
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

  async deleteAttachment(
    bookingId: string,
    attachmentId: string,
    actorId: string,
  ): Promise<BookingAttachmentSummary> {
    return this.request<BookingAttachmentSummary>(
      `/internal/bookings/${bookingId}/attachments/${attachmentId}`,
      'DELETE',
      { actorId },
    );
  }

  async raiseDispute(
    bookingId: string,
    input: RaiseBookingDisputeRequest & { actorId: string },
  ): Promise<BookingDisputeSummary> {
    return this.request<BookingDisputeSummary>(
      `/internal/bookings/${bookingId}/disputes`,
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
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
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
      if (code === 'invalid_booking_request') {
        throw new InvalidBookingRequestError();
      }
      if (code === 'booking_not_found') {
        throw new BookingNotFoundError();
      }
      if (code === 'provider_unavailable') {
        throw new ProviderUnavailableError();
      }
      if (code === 'attachment_not_found') {
        throw new AttachmentNotFoundError();
      }
      if (code === 'attachment_forbidden') {
        throw new AttachmentForbiddenError();
      }
      if (code === 'dispute_forbidden') {
        throw new DisputeForbiddenError();
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
