import { useMemo } from 'react';
import { customerCancelReasons } from '../../../constants/appContent';
import { AppRole } from '../../../navigation/types';
import { BookingStatus } from '../../../shared/models/types';
import { nextBookingStatuses } from '../../../shared/utils/booking';

type CustomerCancelBookingViewModelInput = {
  appRole: AppRole | 'guest';
  cancelReason: string;
  selectedBookingStatus?: BookingStatus;
};

type CustomerCancelReasonRow = {
  reason: string;
  selected: boolean;
};

export function useCustomerCancelBookingViewModel({
  appRole,
  cancelReason,
  selectedBookingStatus,
}: CustomerCancelBookingViewModelInput) {
  return useMemo(
    () =>
      buildCustomerCancelBookingViewModel({
        appRole,
        cancelReason,
        selectedBookingStatus,
      }),
    [appRole, cancelReason, selectedBookingStatus],
  );
}

export function buildCustomerCancelBookingViewModel({
  appRole,
  cancelReason,
  selectedBookingStatus,
}: CustomerCancelBookingViewModelInput) {
  const canCancel = selectedBookingStatus
    ? nextBookingStatuses(selectedBookingStatus, appRole).includes('cancelled')
    : false;
  const hasReason = Boolean(cancelReason);
  const reasonRows: CustomerCancelReasonRow[] = customerCancelReasons.map((reason) => ({
    reason,
    selected: cancelReason === reason,
  }));

  return {
    data: {
      canSubmit: hasReason && canCancel,
      helperText: hasReason ? null : 'Select a reason to continue.',
      reasonRows,
    },
    isLoading: false,
    error: null,
  };
}
