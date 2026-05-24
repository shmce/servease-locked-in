import { Injectable } from '@nestjs/common';
import { BookingGatewayService } from '../booking/booking.service';
import {
  BookingSummary,
  BookingTimelineEventSummary,
} from '../booking/booking.types';
import { CatalogGatewayService } from '../catalog/catalog.service';
import {
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
} from '../catalog/catalog.types';
import { CurrentUserService } from '../current-user/current-user.service';
import type { CurrentUserProfile } from '../current-user/current-user.types';
import { PaymentGatewayService } from '../payments/payment.service';
import { PaymentSummary } from '../payments/payment.types';
import {
  ProviderApprovalRequiredError,
  ProviderProfileRequiredError,
} from './provider.errors';
import {
  ProviderDashboardSummary,
  ProviderProfileSnapshot,
} from './provider.types';

@Injectable()
export class ProviderGatewayService {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly catalogGatewayService: CatalogGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async getProviderProfile(userId: string): Promise<ProviderProfileSnapshot> {
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'provider' || !currentUser.providerProfile) {
      throw new ProviderProfileRequiredError();
    }

    const providerId = currentUser.providerProfile.id;
    const [services, portfolio] = await Promise.all([
      this.catalogGatewayService.listProviderListings(undefined, providerId),
      this.catalogGatewayService.listProviderPortfolio(providerId),
    ]);

    return {
      account: currentUser.user,
      provider: currentUser.providerProfile,
      services,
      portfolio,
    };
  }

  async getProviderDashboard(
    userId: string,
  ): Promise<ProviderDashboardSummary> {
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'provider' || !currentUser.providerProfile) {
      throw new ProviderProfileRequiredError();
    }

    const providerId = currentUser.providerProfile.id;
    const [bookings, payments] = await Promise.all([
      this.bookingGatewayService.listBookings(null, providerId),
      this.paymentGatewayService.listPayments({
        customerId: userId,
        providerId,
      }),
    ]);

    const today = formatDateKey(new Date());
    const todayBookings = bookings.filter(
      (booking) => formatDateKey(new Date(booking.scheduledAt)) === today,
    );
    const paidPayments = payments.filter(
      (payment) => payment.status === 'paid',
    );
    const todayEarnings = paidPayments
      .filter((payment) => paymentDateKey(payment) === today)
      .reduce((sum, payment) => sum + payment.providerPayout, 0);
    const totalEarnings = paidPayments.reduce(
      (sum, payment) => sum + payment.providerPayout,
      0,
    );
    const responseTimeMinutes = await calculateResponseTimeMinutes(
      bookings,
      providerId,
      this.bookingGatewayService,
    );

    return {
      summary: {
        newRequests: bookings.filter((booking) => booking.status === 'pending')
          .length,
        todayBookings: todayBookings.length,
        todayCompleted: todayBookings.filter(
          (booking) => booking.status === 'completed',
        ).length,
        todayEarnings,
        totalEarnings,
        overallRating: currentUser.providerProfile.averageRating,
        reviewCount: currentUser.providerProfile.reviewCount,
      },
      upcomingBookings: bookings
        .filter((booking) =>
          ['pending', 'confirmed', 'in_progress'].includes(booking.status),
        )
        .sort(
          (left, right) =>
            new Date(left.scheduledAt).getTime() -
            new Date(right.scheduledAt).getTime(),
        )
        .slice(0, 5)
        .map((booking) => mapDashboardBooking(booking)),
      performance: {
        acceptanceRate: calculateAcceptanceRate(bookings),
        completionRate: calculateCompletionRate(bookings),
        cancellationRate: calculateCancellationRate(bookings),
        responseTimeMinutes,
      },
    };
  }

  async listProviderServices(
    userId: string,
  ): Promise<ProviderOwnedServiceSummary[]> {
    await this.requireProviderProfile(userId);
    return this.catalogGatewayService.listProviderOwnedServices(userId);
  }

  async replaceProviderServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]> {
    const currentUser = await this.requireProviderProfile(userId);
    if (currentUser.providerProfile.verificationStatus !== 'approved') {
      throw new ProviderApprovalRequiredError();
    }

    return this.catalogGatewayService.replaceProviderOwnedServices(
      userId,
      services,
    );
  }

  private async requireProviderProfile(
    userId: string,
  ): Promise<
    CurrentUserProfile & {
      providerProfile: NonNullable<CurrentUserProfile['providerProfile']>;
    }
  > {
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'provider' || !currentUser.providerProfile) {
      throw new ProviderProfileRequiredError();
    }

    return currentUser as CurrentUserProfile & {
      providerProfile: NonNullable<CurrentUserProfile['providerProfile']>;
    };
  }
}

function mapDashboardBooking(booking: BookingSummary) {
  return {
    id: booking.id,
    scheduledAt: booking.scheduledAt,
    time: formatTime(new Date(booking.scheduledAt)),
    customerName: booking.customerFullName ?? null,
    serviceTitle: booking.serviceTitle,
    location: booking.serviceAddress,
    status: booking.status,
  };
}

function calculateAcceptanceRate(bookings: BookingSummary[]): number {
  const decisionCount = bookings.filter((booking) =>
    ['confirmed', 'in_progress', 'completed', 'rejected'].includes(
      booking.status,
    ),
  ).length;

  if (decisionCount === 0) {
    return 0;
  }

  const acceptedCount = bookings.filter((booking) =>
    ['confirmed', 'in_progress', 'completed'].includes(booking.status),
  ).length;
  return Math.round((acceptedCount / decisionCount) * 100);
}

function calculateCompletionRate(bookings: BookingSummary[]): number {
  const terminalCount = bookings.filter((booking) =>
    ['completed', 'cancelled'].includes(booking.status),
  ).length;

  if (terminalCount === 0) {
    return 0;
  }

  const completedCount = bookings.filter(
    (booking) => booking.status === 'completed',
  ).length;
  return Math.round((completedCount / terminalCount) * 100);
}

function calculateCancellationRate(bookings: BookingSummary[]): number {
  const terminalCount = bookings.filter((booking) =>
    ['completed', 'cancelled'].includes(booking.status),
  ).length;

  if (terminalCount === 0) {
    return 0;
  }

  const cancelledCount = bookings.filter(
    (booking) => booking.status === 'cancelled',
  ).length;
  return Math.round((cancelledCount / terminalCount) * 100);
}

async function calculateResponseTimeMinutes(
  bookings: BookingSummary[],
  providerId: string,
  bookingGatewayService: BookingGatewayService,
): Promise<number | null> {
  const decidedBookings = bookings.filter((booking) =>
    ['confirmed', 'in_progress', 'completed', 'rejected'].includes(
      booking.status,
    ),
  );

  if (decidedBookings.length === 0) {
    return null;
  }

  const responseTimes = await Promise.all(
    decidedBookings.map(async (booking) => {
      try {
        const timeline = await bookingGatewayService.listTimelineEvents(
          booking.id,
          null,
          providerId,
        );
        return calculateBookingResponseMinutes(timeline);
      } catch {
        return null;
      }
    }),
  );
  const validResponseTimes = responseTimes.filter(
    (minutes): minutes is number => minutes !== null,
  );

  if (validResponseTimes.length === 0) {
    return null;
  }

  const totalMinutes = validResponseTimes.reduce(
    (sum, minutes) => sum + minutes,
    0,
  );
  return Math.round(totalMinutes / validResponseTimes.length);
}

function calculateBookingResponseMinutes(
  timeline: BookingTimelineEventSummary[],
): number | null {
  const createdAt = findTimelineEventDate(
    timeline,
    (event) =>
      event.eventType === 'created' ||
      event.label?.toLowerCase().includes('booking requested') === true,
  );
  const decidedAt = findTimelineEventDate(timeline, (event) => {
    const label = event.label?.toLowerCase() ?? '';
    return (
      event.eventType === 'provider_accepted' ||
      event.eventType === 'provider_rejected' ||
      label.includes('status changed to confirmed') ||
      label.includes('status changed to rejected')
    );
  });

  if (!createdAt || !decidedAt || decidedAt.getTime() < createdAt.getTime()) {
    return null;
  }

  return Math.round((decidedAt.getTime() - createdAt.getTime()) / 60000);
}

function findTimelineEventDate(
  timeline: BookingTimelineEventSummary[],
  predicate: (event: BookingTimelineEventSummary) => boolean,
): Date | null {
  const event = timeline.find((item) => item.createdAt && predicate(item));

  if (!event?.createdAt) {
    return null;
  }

  const date = new Date(event.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function paymentDateKey(payment: PaymentSummary): string | null {
  const value = payment.paidAt ?? payment.createdAt;
  return value ? formatDateKey(new Date(value)) : null;
}

function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
