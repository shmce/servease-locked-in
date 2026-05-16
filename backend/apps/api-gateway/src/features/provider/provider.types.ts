import {
  ProviderPortfolioMediaSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  ProviderServiceListing,
} from '../catalog/catalog.types';
import { BookingStatus } from '../booking/booking.types';
import { CurrentUserProfile } from '../current-user/current-user.types';

export interface ProviderProfileSnapshot {
  account: CurrentUserProfile['user'];
  provider: NonNullable<CurrentUserProfile['providerProfile']>;
  services: ProviderServiceListing[];
  portfolio: ProviderPortfolioMediaSummary[];
}

export interface ProviderDashboardBooking {
  id: string;
  scheduledAt: string;
  time: string;
  customerName: string | null;
  serviceTitle: string | null;
  location: string | null;
  status: BookingStatus;
}

export interface ProviderDashboardSummary {
  summary: {
    newRequests: number;
    todayBookings: number;
    todayCompleted: number;
    todayEarnings: number;
    totalEarnings: number;
    overallRating: number;
    reviewCount: number;
  };
  upcomingBookings: ProviderDashboardBooking[];
  performance: {
    acceptanceRate: number;
    completionRate: number;
    responseTimeMinutes: number | null;
  };
}

export type {
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
};
