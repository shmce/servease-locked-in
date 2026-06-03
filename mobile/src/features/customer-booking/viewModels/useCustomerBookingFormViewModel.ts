import { useMemo } from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';
import {
  customerBookingLocationCanContinue,
  customerBookingLocationNotice,
} from '../../../domain/customerBookingLocation';
import {
  ProviderAvailabilitySchedule,
  ProviderListing,
  CustomerAddressSummary,
} from '../../../shared/models/types';
import { buildCustomerBookingViewModel } from './useCustomerBookingViewModel';

type PinAddressStatus = 'idle' | 'scheduled' | 'resolving' | 'failed';

type CustomerBookingFormViewModelInput = {
  provider: ProviderListing;
  providerAvailability: ProviderAvailabilitySchedule | null;
  scheduledAt: string;
  hoursRequired: string;
  timeSlots: string[];
  bookingSlotError: string;
  address: string;
  serviceLocation: CustomerBookingLocationState;
  savedAddresses: CustomerAddressSummary[];
  selectedSavedAddressId: string | null;
  bookingReferencePhotoUrl: string | null;
  busyAction: string | null;
  pinAddressStatus: PinAddressStatus;
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
  serviceLocation,
  savedAddresses,
  selectedSavedAddressId,
  bookingReferencePhotoUrl,
  busyAction,
  pinAddressStatus,
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
        serviceLocation,
        savedAddresses,
        selectedSavedAddressId,
        bookingReferencePhotoUrl,
        busyAction,
        pinAddressStatus,
        now,
      }),
    [
      address,
      serviceLocation,
      bookingReferencePhotoUrl,
      bookingSlotError,
      busyAction,
      hoursRequired,
      pinAddressStatus,
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
  serviceLocation,
  savedAddresses,
  selectedSavedAddressId,
  bookingReferencePhotoUrl,
  busyAction,
  pinAddressStatus,
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
  const locationCanContinue =
    customerBookingLocationCanContinue(serviceLocation) ||
    serviceLocation.status === 'error';
  if (address.trim() && !locationCanContinue) {
    missingFields.push('a confirmed service pin');
  }

  const baseRate = provider.price ?? 0;
  const estimatedTotal =
    provider.pricingMode === 'hourly' ? baseRate * duration : baseRate;
  const displayName = provider.providerBusinessName ?? provider.title;
  const isPreparingEstimate = busyAction === 'pricing-quote';
  const isResolvingPin =
    busyAction === 'geo-map-search' ||
    busyAction === 'geo-current-location' ||
    busyAction === 'geo-reverse-pin';
  const canContinue =
    missingFields.length === 0 && !isPreparingEstimate && !isResolvingPin;
  const locationNotice = customerBookingLocationNotice(serviceLocation);
  const locationStatusLabel = resolveCustomerBookingLocationStatusLabel(
    serviceLocation,
    pinAddressStatus,
  );
  const continueNotice = canContinue
    ? null
    : isResolvingPin
      ? 'Resolving service location...'
      : locationNotice ?? `Add ${formatMissingFields(missingFields)} to continue.`;

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
      canVerifyAddress: Boolean(address.trim()) && busyAction !== 'geo-map-search',
      useCurrentLocationDisabled: busyAction === 'geo-current-location',
      verifyAddressDisabled: !address.trim() || busyAction === 'geo-map-search',
      saveAddressDisabled: !address.trim() || busyAction === 'save-address',
      useCurrentLocationLabel:
        busyAction === 'geo-current-location' ? 'Locating...' : 'Use current',
      verifyAddressLabel:
        busyAction === 'geo-map-search' ? 'Searching...' : 'Choose on map',
      saveAddressLabel: busyAction === 'save-address' ? 'Saving...' : 'Save as home',
      locationNotice,
      locationStatusLabel,
      locationCoordinateLabel: serviceLocation.confirmedPin
        ? `${serviceLocation.confirmedPin.latitude.toFixed(5)}, ${serviceLocation.confirmedPin.longitude.toFixed(5)}`
        : serviceLocation.pendingPin
          ? `${serviceLocation.pendingPin.latitude.toFixed(5)}, ${serviceLocation.pendingPin.longitude.toFixed(5)}`
          : null,
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
      continueNotice,
      referencePhotoLabel: bookingReferencePhotoUrl
        ? 'Photo attached - tap to replace'
        : 'Attach a photo',
    },
    isLoading: false,
    error: null,
  };
}

function resolveCustomerBookingLocationStatusLabel(
  serviceLocation: CustomerBookingLocationState,
  pinAddressStatus: PinAddressStatus,
): string {
  if (
    serviceLocation.pendingPin &&
    (pinAddressStatus === 'scheduled' || pinAddressStatus === 'resolving')
  ) {
    return 'Finding pin address';
  }

  if (serviceLocation.pendingPin && pinAddressStatus === 'failed') {
    return 'Address lookup needs retry';
  }

  if (serviceLocation.confirmedPin) {
    return 'Confirmed service pin';
  }

  if (serviceLocation.pendingPin) {
    return 'Pin ready to confirm';
  }

  if (serviceLocation.status === 'error') {
    return 'Manual address fallback';
  }

  return 'Service pin required';
}

function formatMissingFields(missingFields: string[]): string {
  return missingFields.join(', ').replace(/, ([^,]*)$/, ' and $1');
}
