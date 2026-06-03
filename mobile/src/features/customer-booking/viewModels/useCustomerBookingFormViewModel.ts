import { useMemo } from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import {
  ProviderAvailabilitySchedule,
  ProviderListing,
  CustomerAddressSummary,
} from '../../../shared/models/types';
import { buildCustomerBookingViewModel } from './useCustomerBookingViewModel';

type CustomerBookingFormViewModelInput = {
  provider: ProviderListing;
  providerAvailability: ProviderAvailabilitySchedule | null;
  scheduledAt: string;
  hoursRequired: string;
  timeSlots: string[];
  bookingSlotError: string;
  address: string;
  savedAddresses: CustomerAddressSummary[];
  selectedSavedAddressId: string | null;
  bookingReferencePhotoUrl: string | null;
  busyAction: string | null;
  now?: Date;
};

export function useCustomerBookingFormViewModel({
  provider,
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  address,
  savedAddresses,
  selectedSavedAddressId,
  bookingReferencePhotoUrl,
  busyAction,
  now,
}: CustomerBookingFormViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingFormViewModel({
        provider,
        providerAvailability,
        scheduledAt,
        hoursRequired,
        timeSlots,
        bookingSlotError,
        address,
        savedAddresses,
        selectedSavedAddressId,
        bookingReferencePhotoUrl,
        busyAction,
        now,
      }),
    [
      address,
      bookingReferencePhotoUrl,
      bookingSlotError,
      busyAction,
      hoursRequired,
      provider,
      providerAvailability,
      savedAddresses,
      selectedSavedAddressId,
      scheduledAt,
      timeSlots,
      now,
    ],
  );
}

export function buildCustomerBookingFormViewModel({
  provider,
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  address,
  savedAddresses,
  selectedSavedAddressId,
  bookingReferencePhotoUrl,
  busyAction,
  now,
}: CustomerBookingFormViewModelInput) {
  const bookingSchedule = buildCustomerBookingViewModel({
    providerAvailability,
    scheduledAt,
    hoursRequired,
    timeSlots,
    bookingSlotError,
    now,
  });
  const { dateOnly, timeOnly, duration, selectedSlotAvailable } =
    bookingSchedule.data;
  const missingFields: string[] = [];

  if (!dateOnly) {
    missingFields.push('a date');
  }
  if (!timeOnly) {
    missingFields.push('a time');
  }
  if (dateOnly && timeOnly && !selectedSlotAvailable) {
    missingFields.push('an available date and time');
  }
  if (!address.trim()) {
    missingFields.push('the service address');
  }

  const baseRate = provider.price ?? 0;
  const estimatedTotal =
    provider.pricingMode === 'hourly' ? baseRate * duration : baseRate;
  const displayName = provider.providerBusinessName ?? provider.title;
  const isPreparingEstimate = busyAction === 'pricing-quote';
  const canContinue = missingFields.length === 0 && !isPreparingEstimate;

  return {
    data: {
      providerInitial: displayName.slice(0, 1),
      providerName: displayName,
      providerMeta: `${provider.title} - ${formatMoney(provider.price)}${
        provider.pricingMode === 'hourly' ? ' / hr' : ''
      }`,
      providerRatingLabel: `${provider.averageRating.toFixed(1)} star rating`,
      duration,
      canContinue,
      continueLabel: isPreparingEstimate ? 'Getting estimate...' : 'Continue to Review',
      canVerifyAddress: Boolean(address.trim()) && busyAction !== 'geo-address',
      useCurrentLocationDisabled: busyAction === 'geo-current-location',
      verifyAddressDisabled: !address.trim() || busyAction === 'geo-address',
      saveAddressDisabled: !address.trim() || busyAction === 'save-address',
      useCurrentLocationLabel:
        busyAction === 'geo-current-location' ? 'Locating...' : 'Use current',
      verifyAddressLabel: busyAction === 'geo-address' ? 'Checking...' : 'Verify address',
      saveAddressLabel: busyAction === 'save-address' ? 'Saving...' : 'Save as home',
      savedAddressOptions: savedAddresses.map((item) => ({
        id: item.id,
        label: item.isDefault ? `${item.label} (default)` : item.label,
        address: item.address,
        isSelected: item.id === selectedSavedAddressId,
      })),
      footerRateLabel:
        provider.pricingMode === 'hourly'
          ? `${formatMoney(provider.price)} x ${duration}h`
          : 'Service rate',
      calloutFeeLabel: 'Calculated on review',
      estimatedTotalLabel: formatMoney(estimatedTotal),
      continueNotice: canContinue
        ? null
        : `Add ${formatMissingFields(missingFields)} to continue.`,
      referencePhotoLabel: bookingReferencePhotoUrl
        ? 'Photo attached - tap to replace'
        : 'Attach a photo',
    },
    isLoading: false,
    error: null,
  };
}

function formatMissingFields(missingFields: string[]): string {
  return missingFields.join(', ').replace(/, ([^,]*)$/, ' and $1');
}
