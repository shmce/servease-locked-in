import { Injectable } from '@nestjs/common';
import { BookingGatewayService } from '../booking/booking.service';
import { BookingSummary } from '../booking/booking.types';
import { CatalogGatewayService } from '../catalog/catalog.service';
import {
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
} from '../catalog/catalog.types';
import { CurrentUserService } from '../current-user/current-user.service';
import { PaymentGatewayService } from '../payments/payment.service';
import { PaymentSummary } from '../payments/payment.types';
import { ProviderProfileRequiredError } from './provider.errors';
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

    if (
      currentUser.user.role !== 'provider' ||
      !currentUser.providerProfile
    ) {
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

  async getProviderDashboard(userId: string): Promise<ProviderDashboardSummary> {
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (
      currentUser.user.role !== 'provider' ||
      !currentUser.providerProfile
    ) {
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
    const paidPayments = payments.filter((payment) => payment.status === 'paid');
    const todayEarnings = paidPayments
      .filter((payment) => paymentDateKey(payment) === today)
      .reduce((sum, payment) => sum + payment.providerPayout, 0);
    const totalEarnings = paidPayments.reduce(
      (sum, payment) => sum + payment.providerPayout,
      0,
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
        responseTimeMinutes: null,
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
    await this.requireProviderProfile(userId);
    return this.catalogGatewayService.replaceProviderOwnedServices(
      userId,
      services,
    );
  }

  private async requireProviderProfile(userId: string): Promise<void> {
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (
      currentUser.user.role !== 'provider' ||
      !currentUser.providerProfile
    ) {
      throw new ProviderProfileRequiredError();
    }
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
    ['confirmed', 'in_progress', 'completed', 'rejected'].includes(booking.status),
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
