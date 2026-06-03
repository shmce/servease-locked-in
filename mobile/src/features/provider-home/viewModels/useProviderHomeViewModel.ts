import { useMemo } from 'react';
import {
  buildProviderHomePerformanceCards,
  buildProviderHomeViewModel,
} from './providerHomeModel';
import type {
  ProviderHomePerformanceCard,
  ProviderHomeViewModel,
} from './providerHomeModel';
import type {
  BookingSummary,
  CurrentUserProfile,
  PaymentSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';

type ProviderHomeViewModelResult = {
  data: ProviderHomeViewModel & {
    businessName: string;
    greetingName: string;
    ratingLabel: string;
    performanceCards: ProviderHomePerformanceCard[];
    todayEarningsLabel: string;
    todayLabel: string;
    weekEarningsLabel: string;
  };
  isLoading: boolean;
  error: string | null;
};

export function useProviderHomeViewModel({
  bookings,
  payments,
  payoutTotal,
  minimumPayoutAmount,
  now,
  profile,
  providerDashboard,
}: {
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  payoutTotal: number;
  minimumPayoutAmount: number;
  now: Date;
  profile: CurrentUserProfile | null;
  providerDashboard: ProviderDashboardSummary | null;
}): ProviderHomeViewModelResult {
  return useMemo(
    () => {
      const model = buildProviderHomeViewModel({
        bookings,
        payments,
        payoutTotal,
        minimumPayoutAmount,
        now,
      });
      const rating =
        providerDashboard?.summary.overallRating ??
        profile?.providerProfile?.averageRating ??
        0;
      const ratingLabel = rating.toFixed(1);
      const businessName =
        profile?.providerProfile?.businessName ??
        profile?.user.fullName ??
        'Service Provider';

      return {
        data: {
          ...model,
          businessName,
          greetingName: formatProviderHomeGreetingName(businessName),
          ratingLabel,
          performanceCards: buildProviderHomePerformanceCards({
            todayEarnings: model.todayEarnings,
            weekEarnings: model.weekEarnings,
            ratingLabel,
          }),
          todayEarningsLabel: model.todayEarningsLabel,
          todayLabel: now.toLocaleDateString('en-PH', { weekday: 'long' }),
          weekEarningsLabel: model.weekEarningsLabel,
        },
        isLoading: false,
        error: null,
      };
    },
    [
      bookings,
      payments,
      payoutTotal,
      minimumPayoutAmount,
      now,
      profile,
      providerDashboard,
    ],
  );
}

function formatProviderHomeGreetingName(value: string): string {
  const trimmed = value.trim();
  const suffixes = ['Home Services', 'Services'];

  for (const suffix of suffixes) {
    if (trimmed.toLowerCase().endsWith(` ${suffix.toLowerCase()}`)) {
      const compact = trimmed.slice(0, -suffix.length).trim();
      return compact || trimmed;
    }
  }

  return trimmed;
}
