import { useMemo } from 'react';
import { ProviderBookingTab } from '../../../constants/appContent';
import { filterProviderBookings } from '../../../domain/providerBookings';
import { BookingSummary } from '../../../shared/models/types';

export function useProviderBookingsViewModel({
  bookings,
  providerBookingTab,
  providerSearchQuery,
}: {
  bookings: BookingSummary[];
  providerBookingTab: ProviderBookingTab;
  providerSearchQuery: string;
}) {
  const providerVisibleBookings = useMemo(
    () =>
      filterProviderBookings(
        bookings,
        providerBookingTab,
        providerSearchQuery,
      ),
    [bookings, providerBookingTab, providerSearchQuery],
  );

  return {
    data: providerVisibleBookings,
    isLoading: false,
    error: null,
  };
}
