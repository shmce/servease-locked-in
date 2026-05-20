import { Injectable, Logger } from '@nestjs/common';
import { Observable, from, timer } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CurrentUserIdentity } from '../current-user/current-user.types';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { GeoServiceClient } from '../geo/clients/geo-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { PaymentGatewayService } from '../payments/payment.service';
import { PaymentSummary } from '../payments/payment.types';
import { PricingGatewayService } from '../pricing/pricing.service';
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
} from './booking.types';
import {
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
} from './booking.errors';

const TRACKING_STREAM_INTERVAL_MS = 2000;

@Injectable()
export class BookingGatewayService {
  private readonly logger = new Logger(BookingGatewayService.name);

  constructor(
    private readonly bookingServiceClient: BookingServiceClient,
    private readonly authServiceClient: AuthServiceClient,
    private readonly notificationServiceClient?: NotificationServiceClient,
    private readonly catalogServiceClient?: CatalogServiceClient,
    private readonly geoServiceClient?: GeoServiceClient,
    private readonly pricingGatewayService?: PricingGatewayService,
    private readonly paymentGatewayService?: PaymentGatewayService,
  ) {}

  async createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    const bookingInput = await this.applyAcceptedQuote(customerId, input);
    const booking = await this.enrichBooking(
      await this.bookingServiceClient.createBooking(customerId, bookingInput),
    );
    await this.ensureCashPaymentReserved(
      booking,
      bookingInput.paymentMethod ?? 'cash_on_service',
    );
    await this.notifyProviderBookingCreated(booking);
    return booking;
  }

  private async applyAcceptedQuote(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<CreateBookingRequest> {
    const acceptedQuoteId = input.acceptedQuoteId?.trim();
    if (!acceptedQuoteId) {
      return input;
    }

    if (!this.pricingGatewayService) {
      return input;
    }

    const quote = await this.pricingGatewayService.validateQuote(acceptedQuoteId);
    if (
      quote.customerId !== customerId ||
      quote.providerId !== input.providerId ||
      quote.serviceId !== input.serviceId ||
      !Number.isFinite(quote.amount) ||
      quote.amount <= 0
    ) {
      throw new InvalidBookingRequestError();
    }

    return {
      ...input,
      acceptedQuoteId,
      serviceAmount: quote.amount,
      pricingMode: quote.pricingMode,
      quoteFairnessStatus: quote.fairnessStatus,
      quoteConfidence: quote.confidence,
    };
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

  streamTrackingSnapshots(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Observable<BookingTrackingSnapshot> {
    let previousSnapshot: BookingTrackingSnapshot | null = null;

    return timer(0, TRACKING_STREAM_INTERVAL_MS).pipe(
      exhaustMap(() =>
        from(
          this.getTrackingSnapshotForStream(
            bookingId,
            customerId,
            providerId,
            previousSnapshot,
          ),
        ).pipe(
          map((snapshot) => {
            previousSnapshot = snapshot;
            return snapshot;
          }),
        ),
      ),
    );
  }

  updateLiveLocation(
    bookingId: string,
    providerId: string,
    input: UpdateBookingLiveLocationRequest,
  ): Promise<BookingTrackingLocation> {
    return this.bookingServiceClient.updateLiveLocation(
      bookingId,
      providerId,
      input,
    );
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
    const completionPayment = await this.assertPaymentAllowsCompletion(
      visibleBooking,
      nextStatus,
    );

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
    await this.confirmCashPaymentAfterCompletion(
      booking,
      nextStatus,
      completionPayment,
    );
    await this.notifyBookingStatusChanged(booking, actorId, providerId);
    return booking;
  }

  private async ensureCashPaymentReserved(
    booking: BookingSummary,
    paymentMethod: string | null | undefined,
  ): Promise<void> {
    if (
      !this.paymentGatewayService ||
      paymentMethod !== 'cash_on_service' ||
      !Number.isFinite(booking.totalAmount) ||
      booking.totalAmount <= 0
    ) {
      return;
    }

    await this.dispatchPaymentSideEffect(async () => {
      await this.paymentGatewayService?.createPayment({
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        amount: booking.totalAmount,
        paymentMethod: 'cash_on_service',
      });
    });
  }

  private async assertPaymentAllowsCompletion(
    booking: BookingSummary,
    nextStatus: BookingStatus,
  ): Promise<PaymentSummary | null> {
    if (nextStatus !== 'completed' || !this.paymentGatewayService) {
      return null;
    }

    const payment = await this.findPaymentForBooking(booking);
    if (payment?.paymentMethod === 'cash_on_service') {
      return payment;
    }

    if (!payment || payment.status !== 'paid') {
      throw new InvalidBookingTransitionError();
    }

    return payment;
  }

  private async confirmCashPaymentAfterCompletion(
    booking: BookingSummary,
    nextStatus: BookingStatus,
    payment: PaymentSummary | null,
  ): Promise<void> {
    if (
      nextStatus !== 'completed' ||
      payment?.paymentMethod !== 'cash_on_service' ||
      !this.paymentGatewayService
    ) {
      return;
    }

    await this.paymentGatewayService.confirmCashOnServicePayment(
      booking.id,
      booking.providerId,
    );
  }

  private async findPaymentForBooking(booking: BookingSummary) {
    const payments = await this.paymentGatewayService?.listPayments({
      customerId: booking.customerId,
      providerId: booking.providerId,
    });

    return payments?.find((payment) => payment.bookingId === booking.id) ?? null;
  }

  private async dispatchPaymentSideEffect(
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.warn(
        `Payment side effect failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private async notifyProviderBookingCreated(
    booking: BookingSummary,
  ): Promise<void> {
    if (!this.notificationServiceClient || !this.catalogServiceClient) {
      return;
    }

    await this.dispatchNotificationSideEffect(async () => {
      const providerOwner =
        await this.catalogServiceClient?.findProviderOwnerByProviderId(
          booking.providerId,
        );

      if (!providerOwner) {
        return;
      }

      await this.notificationServiceClient?.createNotification({
        userId: providerOwner.userId,
        type: 'booking_created',
        title: 'New booking request',
        body: `${booking.customerFullName ?? 'A customer'} requested ${
          booking.serviceTitle ?? 'a service booking'
        }.`,
        metadata: this.bookingNotificationMetadata(booking),
      });
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
      await this.dispatchNotificationSideEffect(async () => {
        await this.notificationServiceClient?.createNotification({
          userId: booking.customerId,
          type: 'booking_status_updated',
          title: `Booking ${this.statusLabel(booking.status)}`,
          body: `Your ${booking.serviceTitle ?? 'service'} booking was ${this.statusLabel(
            booking.status,
          )}.`,
          metadata: this.bookingNotificationMetadata(booking),
        });
      });
      return;
    }

    if (booking.customerId === actorId && this.catalogServiceClient) {
      await this.dispatchNotificationSideEffect(async () => {
        const providerOwner =
          await this.catalogServiceClient?.findProviderOwnerByProviderId(
            booking.providerId,
          );

        if (!providerOwner) {
          return;
        }

        await this.notificationServiceClient?.createNotification({
          userId: providerOwner.userId,
          type: 'booking_status_updated',
          title: `Booking ${this.statusLabel(booking.status)}`,
          body: `${booking.customerFullName ?? 'A customer'} ${this.statusLabel(
            booking.status,
          )} ${booking.serviceTitle ?? 'a service'} booking.`,
          metadata: this.bookingNotificationMetadata(booking),
        });
      });
    }
  }

  private async dispatchNotificationSideEffect(
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.warn(
        `Booking notification dispatch failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
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

  private async getTrackingSnapshotForStream(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
    previousSnapshot: BookingTrackingSnapshot | null,
  ): Promise<BookingTrackingSnapshot> {
    const snapshot = await this.bookingServiceClient.getTrackingSnapshot(
      bookingId,
      customerId,
      providerId,
    );

    return this.enrichTrackingSnapshot({
      ...snapshot,
      destinationAddress:
        previousSnapshot?.destinationAddress ?? snapshot.destinationAddress,
      destinationLocation:
        previousSnapshot?.destinationLocation ?? snapshot.destinationLocation,
    });
  }
}
