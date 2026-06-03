import { Injectable, Logger } from '@nestjs/common';
import { Observable, from, timer } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CurrentUserIdentity } from '../current-user/current-user.types';
import { CatalogServiceClient as CatalogBrowseServiceClient } from '../catalog/clients/catalog-service.client';
import { ProviderServiceListing } from '../catalog/catalog.types';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { GeoServiceClient } from '../geo/clients/geo-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { PaymentGatewayService } from '../payments/payment.service';
import { PaymentSummary } from '../payments/payment.types';
import { buildBookingPriceBreakdown } from './booking-price-breakdown';
import {
  isFutureBookingSchedule,
  isProviderServiceStartWindowOpen,
  parseBookingScheduleInstant,
} from '../../../../../libs/common/src';
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
  BookingPricingMode,
  CreateBookingServiceUpdateRequest,
  CreateBookingRequest,
  RaiseBookingDisputeRequest,
  UpdateBookingLiveLocationRequest,
} from './booking.types';
import {
  BookingScheduleInPastError,
  BookingStartWindowNotOpenError,
  InvalidBookingScheduleError,
  InvalidBookingTransitionError,
} from './booking.errors';

const TRACKING_STREAM_INTERVAL_MS = 2000;
const PROVIDER_OPERATIONAL_TRANSITIONS = new Set<BookingStatus>([
  'confirmed',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
]);

interface BookingPricingSource {
  serviceRate: number;
  pricingMode: BookingPricingMode;
  serviceTitle?: string | null;
  serviceDescription?: string | null;
  fallbackReason: string | null;
}

@Injectable()
export class BookingGatewayService {
  private readonly logger = new Logger(BookingGatewayService.name);

  constructor(
    private readonly bookingServiceClient: BookingServiceClient,
    private readonly authServiceClient: AuthServiceClient,
    private readonly notificationServiceClient?: NotificationServiceClient,
    private readonly catalogServiceClient?: CatalogServiceClient,
    private readonly geoServiceClient?: GeoServiceClient,
    private readonly paymentGatewayService?: PaymentGatewayService,
    private readonly catalogBrowseServiceClient?: CatalogBrowseServiceClient,
  ) {}

  async createBooking(
    customerId: string,
    input: CreateBookingRequest,
  ): Promise<BookingSummary> {
    this.assertBookingScheduleCanBeCreated(input.scheduledAt);
    const bookingInput = await this.withBookingPriceBreakdown(input);
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

  private async withBookingPriceBreakdown(
    input: CreateBookingRequest,
  ): Promise<CreateBookingRequest> {
    const pricing = await this.resolveBookingPricingSource(input);
    const priceBreakdown = buildBookingPriceBreakdown({
      serviceRate: pricing.serviceRate,
      pricingMode: pricing.pricingMode,
      hoursRequired: input.hoursRequired,
      fallbackReason: pricing.fallbackReason,
    });
    return {
      ...input,
      serviceTitle:
        input.serviceTitle ?? pricing.serviceTitle ?? input.serviceName ?? null,
      serviceDescription:
        input.serviceDescription ?? pricing.serviceDescription ?? null,
      serviceAmount: priceBreakdown.serviceSubtotal,
      totalAmount: priceBreakdown.total,
      pricingMode: pricing.pricingMode,
      acceptedQuoteId: null,
      quoteFairnessStatus: null,
      quoteConfidence: null,
      priceBreakdown,
    };
  }

  private async resolveBookingPricingSource(
    input: CreateBookingRequest,
  ): Promise<BookingPricingSource> {
    const fallbackSource: BookingPricingSource = {
      serviceRate: this.positiveAmount(input.serviceAmount) ?? 0,
      pricingMode: input.pricingMode === 'hourly' ? 'hourly' : 'flat',
      serviceTitle: input.serviceTitle ?? input.serviceName ?? null,
      serviceDescription: input.serviceDescription ?? null,
      fallbackReason: 'provider_rate_unavailable',
    };

    if (!this.catalogBrowseServiceClient) {
      return fallbackSource;
    }

    try {
      const listings =
        await this.catalogBrowseServiceClient.listProviderListings(
          input.serviceId ?? undefined,
          input.providerId,
        );
      const listing = this.findBestProviderListing(input, listings);
      const listingRate = this.positiveAmount(listing?.price);
      if (!listing || listingRate === null) {
        return fallbackSource;
      }

      return {
        serviceRate: listingRate,
        pricingMode: listing.pricingMode,
        serviceTitle: input.serviceTitle ?? listing.title,
        serviceDescription: input.serviceDescription ?? listing.description,
        fallbackReason: null,
      };
    } catch (error) {
      this.logger.warn(
        `Could not resolve provider rate for booking price breakdown: ${this.errorMessage(error)}`,
      );
      return fallbackSource;
    }
  }

  private findBestProviderListing(
    input: CreateBookingRequest,
    listings: ProviderServiceListing[],
  ): ProviderServiceListing | null {
    return (
      listings.find(
        (listing) =>
          listing.providerId === input.providerId &&
          listing.verificationStatus === 'approved' &&
          (!input.serviceId || listing.serviceId === input.serviceId),
      ) ??
      listings.find(
        (listing) =>
          listing.providerId === input.providerId &&
          (!input.serviceId || listing.serviceId === input.serviceId),
      ) ??
      null
    );
  }

  private positiveAmount(value: number | null | undefined): number | null {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
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
    return this.enrichTrackingSnapshot(
      await this.bookingServiceClient.getTrackingSnapshot(
        bookingId,
        customerId,
        providerId,
      ),
    );
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
    this.assertActorCanTransition(
      visibleBooking,
      actorId,
      providerId,
      nextStatus,
    );
    this.assertProviderStartWindowAllowsTransition(
      visibleBooking,
      providerId,
      nextStatus,
    );
    await this.assertProviderOperationalLockAllowsTransition(
      visibleBooking,
      providerId,
      nextStatus,
    );
    const completionPayment = await this.assertPaymentAllowsCompletion(
      visibleBooking,
      nextStatus,
    );

    const didTransition = visibleBooking.status !== nextStatus;
    const booking = await this.enrichBooking(
      didTransition
        ? await this.transitionBookingStatusSafely(
            bookingId,
            actorId,
            visibleBooking.status,
            nextStatus,
            reason,
            explanation,
          )
        : visibleBooking,
    );
    await this.confirmCashPaymentAfterCompletion(
      booking,
      nextStatus,
      completionPayment,
    );
    if (didTransition) {
      await this.notifyBookingStatusChanged(booking, actorId, providerId);
    }
    return booking;
  }

  private async transitionBookingStatusSafely(
    bookingId: string,
    actorId: string,
    currentStatus: BookingStatus,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    if (currentStatus === 'confirmed' && nextStatus === 'completed') {
      const startedBooking = await this.bookingServiceClient.transitionStatus(
        bookingId,
        actorId,
        'confirmed',
        'in_progress',
        undefined,
        undefined,
      );
      return this.bookingServiceClient.transitionStatus(
        bookingId,
        actorId,
        startedBooking.status,
        'completed',
        reason,
        explanation,
      );
    }

    return this.bookingServiceClient.transitionStatus(
      bookingId,
      actorId,
      currentStatus,
      nextStatus,
      reason,
      explanation,
    );
  }

  private assertBookingScheduleCanBeCreated(scheduledAt: string): void {
    if (!parseBookingScheduleInstant(scheduledAt)) {
      throw new InvalidBookingScheduleError();
    }

    if (!isFutureBookingSchedule(scheduledAt)) {
      throw new BookingScheduleInPastError();
    }
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

    return (
      payments?.find((payment) => payment.bookingId === booking.id) ?? null
    );
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

    if (
      nextStatus === 'cancelled' &&
      (isBookingCustomer || isAssignedProvider)
    ) {
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

  private async assertProviderOperationalLockAllowsTransition(
    booking: BookingSummary,
    providerId: string | null,
    nextStatus: BookingStatus,
  ): Promise<void> {
    if (
      providerId === null ||
      booking.status === nextStatus ||
      booking.status === 'in_progress' ||
      !PROVIDER_OPERATIONAL_TRANSITIONS.has(nextStatus)
    ) {
      return;
    }

    const activeBooking = (
      await this.bookingServiceClient.listBookings(null, providerId)
    ).find((candidate) => candidate.status === 'in_progress');

    if (activeBooking && activeBooking.id !== booking.id) {
      throw new InvalidBookingTransitionError();
    }
  }

  private assertProviderStartWindowAllowsTransition(
    booking: BookingSummary,
    providerId: string | null,
    nextStatus: BookingStatus,
  ): void {
    if (
      providerId === null ||
      booking.status === nextStatus ||
      booking.status === 'in_progress' ||
      !['in_progress', 'completed'].includes(nextStatus)
    ) {
      return;
    }

    if (booking.status !== 'confirmed') {
      return;
    }

    if (!isProviderServiceStartWindowOpen(booking.scheduledAt)) {
      throw new BookingStartWindowNotOpenError();
    }
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
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not resolve provider business name for ${providerId}: ${this.errorMessage(error)}`,
          );
          return Promise.resolve(
            this.catalogServiceClient?.findProviderOwnerByProviderId(
              providerId,
            ),
          ).then((owner) => owner?.businessName ?? null);
        })
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not resolve provider owner for ${providerId}: ${this.errorMessage(error)}`,
          );
          return null;
        });
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
    } catch (error) {
      this.logger.warn(
        `Could not geocode booking tracking destination: ${this.errorMessage(error)}`,
      );
      return snapshot;
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
