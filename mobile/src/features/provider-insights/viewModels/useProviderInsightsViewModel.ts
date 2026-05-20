import { useMemo } from 'react';
import {
  BookingSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

function responseTimeLabel(responseTime: number | null | undefined): string {
  if (responseTime === null || responseTime === undefined) {
    return 'Not enough data';
  }

  return responseTime < 60
    ? `${responseTime} min`
    : `${(responseTime / 60).toFixed(1)} hr`;
}

function rateLabel(rate: number | null | undefined): string {
  return rate === null || rate === undefined ? 'Not enough data' : `${rate}%`;
}

export function useProviderInsightsViewModel({
  providerDashboard,
  bookings,
}: {
  providerDashboard: ProviderDashboardSummary | null;
  bookings: BookingSummary[];
}) {
  const data = useMemo(() => {
    const summary = providerDashboard?.summary;
    const performance = providerDashboard?.performance;
    const acceptanceRate = performance?.acceptanceRate ?? null;
    const completionRate = performance?.completionRate ?? null;
    const totalBookings = bookings.length;
    const completedCount = bookings.filter((booking) => booking.status === 'completed').length;
    const cancelledCount = bookings.filter(
      (booking) => booking.status === 'cancelled' || booking.status === 'rejected',
    ).length;
    const repeatCustomers = new Set(
      bookings
        .filter((booking) => booking.status === 'completed')
        .map((booking) => booking.customerId),
    ).size;
    const overallRating = summary?.overallRating ?? 0;
    const growthTips = [
      acceptanceRate !== null && acceptanceRate < 80
        ? 'Accept more requests within an hour to lift your acceptance rate.'
        : 'Great job keeping your acceptance rate high — keep it up!',
      overallRating < 4
        ? 'Reply to recent reviews and ask satisfied customers for ratings.'
        : 'Customers love your work — share your profile to attract more bookings.',
    ];

    return {
      totalEarnings: formatMoney(summary?.totalEarnings ?? 0),
      overallRating: overallRating.toFixed(1),
      totalReviews: summary?.reviewCount ?? 0,
      todayEarnings: formatMoney(summary?.todayEarnings ?? 0),
      acceptanceRateLabel: rateLabel(acceptanceRate),
      completionRateLabel: rateLabel(completionRate),
      responseTimeLabel: responseTimeLabel(performance?.responseTimeMinutes),
      totalBookings,
      completedCount,
      cancelledCount,
      repeatCustomers,
      newRequests: summary?.newRequests ?? 0,
      todayBookings: summary?.todayBookings ?? 0,
      growthTips,
    };
  }, [bookings, providerDashboard]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
