import { Injectable } from '@nestjs/common';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CurrentUserIdentity } from '../current-user/current-user.types';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { GeoServiceClient } from '../geo/clients/geo-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import {
  AddBookingAttachmentRequest,
  BookingAttachmentSummary,
  BookingDisputeSummary,
  BookingServiceUpdateSummary,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  BookingTrackingSnapshot,
  CreateBookingServiceUpdateRequest,
  CreateBookingRequest,
  RaiseBookingDisputeRequest,
} from './booking.types';
import { InvalidBookingTransitionError } from './booking.errors';

@Injectable()
export class BookingGatewayService {
  constructor(
    private readonly bookingServiceClient: BookingServiceClient,
    private readonly authServiceClient: AuthServiceClient,
    private readonly notificationServiceClient?: NotificationServiceClient,
    private readonly catalogServiceClient?: CatalogServiceClient,
    private readonly geoServiceClient?: GeoServiceClient,
  ) {}

  async createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    const booking = await this.enrichBooking(
      await this.bookingServiceClient.createBooking(customerId, input),
    );
    await this.notifyProviderBookingCreated(booking);
    return booking;
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

  async getTrackingSnapshot(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTrackingSnapshot> {
    return this.enrichTrackingSnapshot(await this.bookingServiceClient.getTrackingSnapshot(
      bookingId,
      customerId,
      providerId,
    ));
  }

  async transitionStatus(
    bookingId: string,
    actorId: string,
    providerId: string | null,
    currentStatus: BookingStatus,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    const visibleBooking = await this.bookingServiceClient.findBooking(
      bookingId,
      actorId,
      providerId,
    );
    this.assertActorCanTransition(visibleBooking, actorId, providerId, nextStatus);

    const booking = await this.enrichBooking(
      await this.bookingServiceClient.transitionStatus(
        bookingId,
        actorId,
        currentStatus,
        nextStatus,
        reason,
        explanation,
      ),
    );
    await this.notifyBookingStatusChanged(booking, actorId, providerId);
    return booking;
  }

  private async notifyProviderBookingCreated(
    booking: BookingSummary,
  ): Promise<void> {
    if (!this.notificationServiceClient || !this.catalogServiceClient) {
      return;
    }

    const providerOwner =
      await this.catalogServiceClient.findProviderOwnerByProviderId(
        booking.providerId,
      );

    await this.notificationServiceClient.createNotification({
      userId: providerOwner.userId,
      type: 'booking_created',
      title: 'New booking request',
      body: `${booking.customerFullName ?? 'A customer'} requested ${
        booking.serviceTitle ?? 'a service booking'
      }.`,
      metadata: this.bookingNotificationMetadata(booking),
    });
  }

  private async notifyBookingStatusChanged(
    booking: BookingSummary,
    actorId: string,
    providerId: string | null,
  ): Promise<void> {
    if (!this.notificationServiceClient) {
      return;
    }

    if (providerId && booking.providerId === providerId) {
      await this.notificationServiceClient.createNotification({
        userId: booking.customerId,
        type: 'booking_status_updated',
        title: `Booking ${this.statusLabel(booking.status)}`,
        body: `Your ${booking.serviceTitle ?? 'service'} booking was ${this.statusLabel(
          booking.status,
        )}.`,
        metadata: this.bookingNotificationMetadata(booking),
      });
      return;
    }

    if (booking.customerId === actorId && this.catalogServiceClient) {
      const providerOwner =
        await this.catalogServiceClient.findProviderOwnerByProviderId(
          booking.providerId,
        );
      await this.notificationServiceClient.createNotification({
        userId: providerOwner.userId,
        type: 'booking_status_updated',
        title: `Booking ${this.statusLabel(booking.status)}`,
        body: `${booking.customerFullName ?? 'A customer'} ${this.statusLabel(
          booking.status,
        )} ${booking.serviceTitle ?? 'a service'} booking.`,
        metadata: this.bookingNotificationMetadata(booking),
      });
    }
  }

  private bookingNotificationMetadata(
    booking: BookingSummary,
  ): Record<string, string> {
    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: booking.status,
    };
  }

  private statusLabel(status: BookingStatus): string {
    return status.replace('_', ' ');
  }

  private assertActorCanTransition(
    booking: BookingSummary,
    actorId: string,
    providerId: string | null,
    nextStatus: BookingStatus,
  ): void {
    const isBookingCustomer = booking.customerId === actorId;
    const isAssignedProvider =
      providerId !== null && booking.providerId === providerId;

    if (nextStatus === 'cancelled' && (isBookingCustomer || isAssignedProvider)) {
      return;
    }

    if (
      isAssignedProvider &&
      ['confirmed', 'rejected', 'in_progress', 'completed'].includes(nextStatus)
    ) {
      return;
    }

    throw new InvalidBookingTransitionError();
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

  deleteAttachment(
    bookingId: string,
    attachmentId: string,
    actorId: string,
  ): Promise<BookingAttachmentSummary> {
    return this.bookingServiceClient.deleteAttachment(
      bookingId,
      attachmentId,
      actorId,
    );
  }

  raiseDispute(
    bookingId: string,
    actorId: string,
    input: RaiseBookingDisputeRequest,
  ): Promise<BookingDisputeSummary> {
    return this.bookingServiceClient.raiseDispute(bookingId, {
      actorId,
      ...input,
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
    const providerCache = new Map<string, Promise<string | null>>();
    return Promise.all(
      bookings.map((booking) =>
        this.enrichBooking(booking, customerCache, providerCache),
      ),
    );
  }

  private async enrichBooking(
    booking: BookingSummary,
    customerCache = new Map<string, Promise<CurrentUserIdentity>>(),
    providerCache = new Map<string, Promise<string | null>>(),
  ): Promise<BookingSummary> {
    let customer = customerCache.get(booking.customerId);

    if (!customer) {
      customer = this.authServiceClient.findUserById(booking.customerId);
      customerCache.set(booking.customerId, customer);
    }

    const customerIdentity = await customer;
    const providerBusinessName =
      booking.providerBusinessName ??
      (await this.providerBusinessName(booking.providerId, providerCache));

    return {
      ...booking,
      customerFullName: customerIdentity.fullName,
      customerContactNumber: customerIdentity.contactNumber,
      providerBusinessName,
    };
  }

  private providerBusinessName(
    providerId: string,
    providerCache: Map<string, Promise<string | null>>,
  ): Promise<string | null> {
    if (!this.catalogServiceClient) {
      return Promise.resolve(null);
    }

    let provider = providerCache.get(providerId);
    if (!provider) {
      provider = this.catalogServiceClient
        .findProviderBusinessNameByProviderId(providerId)
        .catch(() =>
          Promise.resolve(
            this.catalogServiceClient?.findProviderOwnerByProviderId(providerId),
          ).then((owner) => owner?.businessName ?? null),
        )
        .catch(() => null);
      providerCache.set(providerId, provider);
    }

    return provider;
  }

  private async enrichTrackingSnapshot(
    snapshot: BookingTrackingSnapshot,
  ): Promise<BookingTrackingSnapshot> {
    if (
      !this.geoServiceClient ||
      snapshot.destinationLocation ||
      !snapshot.destinationAddress?.trim()
    ) {
      return snapshot;
    }

    try {
      const destination = await this.geoServiceClient.geocodeAddress({
        address: snapshot.destinationAddress,
        language: 'en',
        region: 'ph',
      });

      return {
        ...snapshot,
        destinationAddress:
          destination.formattedAddress || snapshot.destinationAddress,
        destinationLocation: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      };
    } catch {
      return snapshot;
    }
  }
}
