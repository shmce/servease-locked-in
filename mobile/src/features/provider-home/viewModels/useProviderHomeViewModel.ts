import { useMemo } from 'react';
import {
  buildProviderHomeViewModel,
  ProviderHomeViewModel,
} from './providerHomeModel';
import {
  BookingSummary,
  CurrentUserProfile,
  PaymentSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

type ProviderHomeViewModelResult = {
  data: ProviderHomeViewModel & {
    businessName: string;
    ratingLabel: string;
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

      return {
        data: {
          ...model,
          businessName:
            profile?.providerProfile?.businessName ??
            profile?.user.fullName ??
            'Service Provider',
          ratingLabel: rating.toFixed(1),
          todayEarningsLabel: formatMoney(model.todayEarnings),
          todayLabel: now.toLocaleDateString('en-PH', { weekday: 'long' }),
          weekEarningsLabel: formatMoney(model.weekEarnings),
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
