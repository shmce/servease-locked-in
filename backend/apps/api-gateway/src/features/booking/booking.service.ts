import { Injectable } from '@nestjs/common';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CurrentUserIdentity } from '../current-user/current-user.types';
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
} from './booking.types';

@Injectable()
export class BookingGatewayService {
  constructor(
    private readonly bookingServiceClient: BookingServiceClient,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  async createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    return this.enrichBooking(
      await this.bookingServiceClient.createBooking(customerId, input),
    );
  }

  async listBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    return this.enrichBookings(
      await this.bookingServiceClient.listBookings(customerId, providerId),
    );
  }

  async findBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    return this.enrichBooking(
      await this.bookingServiceClient.findBooking(
        bookingId,
        customerId,
        providerId,
      ),
    );
  }

  getTrackingSnapshot(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTrackingSnapshot> {
    return this.bookingServiceClient.getTrackingSnapshot(
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
    return this.enrichBooking(
      await this.bookingServiceClient.transitionStatus(
        bookingId,
        actorId,
        currentStatus,
        nextStatus,
        reason,
        explanation,
      ),
    );
  }

  addAttachment(
    bookingId: string,
    actorId: string,
    customerId: string | null,
    providerId: string | null,
    input: AddBookingAttachmentRequest,
  ): Promise<BookingAttachmentSummary> {
    return this.bookingServiceClient.addAttachment(bookingId, {
      ...input,
      actorId,
      customerId,
      providerId,
    });
  }

  listServiceUpdates(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingServiceUpdateSummary[]> {
    return this.bookingServiceClient.listServiceUpdates(
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
    return this.bookingServiceClient.listTimelineEvents(
      bookingId,
      customerId,
      providerId,
    );
  }

  createServiceUpdate(
    bookingId: string,
    actorId: string,
    providerId: string,
    input: CreateBookingServiceUpdateRequest,
  ): Promise<BookingServiceUpdateSummary> {
    return this.bookingServiceClient.createServiceUpdate(bookingId, {
      ...input,
      actorId,
      providerId,
    });
  }

  private async enrichBookings(
    bookings: BookingSummary[],
  ): Promise<BookingSummary[]> {
    const customerCache = new Map<string, Promise<CurrentUserIdentity>>();
    return Promise.all(
      bookings.map((booking) => this.enrichBooking(booking, customerCache)),
    );
  }

  private async enrichBooking(
    booking: BookingSummary,
    customerCache = new Map<string, Promise<CurrentUserIdentity>>(),
  ): Promise<BookingSummary> {
    let customer = customerCache.get(booking.customerId);

    if (!customer) {
      customer = this.authServiceClient.findUserById(booking.customerId);
      customerCache.set(booking.customerId, customer);
    }

    const customerIdentity = await customer;

    return {
      ...booking,
      customerFullName: customerIdentity.fullName,
      customerContactNumber: customerIdentity.contactNumber,
    };
  }
}
