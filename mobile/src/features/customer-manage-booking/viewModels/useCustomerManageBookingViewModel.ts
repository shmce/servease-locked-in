import { useMemo } from 'react';
import { BookingStatus } from '../../../shared/models/types';

export type CustomerManageBookingAction =
  | 'message'
  | 'track'
  | 'payment'
  | 'report'
  | 'cancel';

type CustomerManageBookingViewModelInput = {
  status?: BookingStatus;
};

type CustomerManageBookingOption = {
  key: CustomerManageBookingAction;
  label: string;
  accessibilityLabel: string;
  tone: 'default' | 'danger';
};

export function useCustomerManageBookingViewModel({
  status,
}: CustomerManageBookingViewModelInput) {
  return useMemo(
    () => buildCustomerManageBookingViewModel({ status }),
    [status],
  );
}

export function buildCustomerManageBookingViewModel({
  status,
}: CustomerManageBookingViewModelInput) {
  const isCancellable = status === 'pending' || status === 'confirmed';
  const isActive = status === 'confirmed' || status === 'in_progress';
  const isCompleted = status === 'completed';
  const optionRows: CustomerManageBookingOption[] = [
    {
      key: 'message',
      label: 'Message Service Provider',
      accessibilityLabel: 'Message service provider',
      tone: 'default',
    },
  ];

  if (isActive) {
    optionRows.push({
      key: 'track',
      label: 'Track Service Provider',
      accessibilityLabel: 'Track service provider',
      tone: 'default',
    });
  }

  if (isCompleted) {
    optionRows.push({
      key: 'payment',
      label: 'View Payment Details',
      accessibilityLabel: 'View payment details',
      tone: 'default',
    });
  }

  optionRows.push({
    key: 'report',
    label: 'Report an issue',
    accessibilityLabel: 'Report an issue',
    tone: 'default',
  });

  if (isCancellable) {
    optionRows.push({
      key: 'cancel',
      label: 'Cancel Booking',
      accessibilityLabel: 'Cancel booking',
      tone: 'danger',
    });
  }

  return {
    data: {
      optionRows,
    },
    isLoading: false,
    error: null,
  };
}
