import { useMemo } from 'react';
import { providerCancelReasons } from '../../../constants/appContent';

type ProviderCancelBookingViewModelInput = {
  busyAction: string | null;
  selectedReason: string;
};

export function useProviderCancelBookingViewModel({
  busyAction,
  selectedReason,
}: ProviderCancelBookingViewModelInput) {
  return useMemo(
    () => buildProviderCancelBookingViewModel({ busyAction, selectedReason }),
    [busyAction, selectedReason],
  );
}

export function buildProviderCancelBookingViewModel({
  busyAction,
  selectedReason,
}: ProviderCancelBookingViewModelInput) {
  return {
    data: {
      canSubmit: Boolean(selectedReason) && busyAction !== 'booking-cancelled',
      reasonRows: providerCancelReasons.map((reason) => ({
        reason,
        selected: selectedReason === reason,
      })),
    },
    isLoading: false,
    error: null,
  };
}
