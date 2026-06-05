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
  const selectedSavedAddress =
    savedAddresses.find((item) => item.id === selectedSavedAddressId) ?? null;
  const selectedSavedAddressLabel = selectedSavedAddress?.isDefault
    ? 'Home'
    : (selectedSavedAddress?.label ?? 'Saved address');
  const isPreparingEstimate = busyAction === 'booking-price-preview';
  const isResolvingPin =
    busyAction === 'geo-map-search' ||
    busyAction === 'geo-picker-search' ||
    busyAction === 'geo-current-location' ||
    busyAction === 'geo-reverse-pin';
  const canContinue =
    missingFields.length === 0 && !isPreparingEstimate && !isResolvingPin;
  const locationNotice = customerBookingLocationNotice(serviceLocation);
  const locationStatusLabel = resolveCustomerBookingLocationStatusLabel(
    serviceLocation,
    pinAddressStatus,
    selectedSavedAddressLabel,
  );
  const locationStatusConfirmed = customerBookingLocationCanContinue(serviceLocation);
  const locationCoordinateLabel = resolveCustomerBookingLocationMeta(
    serviceLocation,
    locationNotice,
    selectedSavedAddressLabel,
  );
  const continueNotice = canContinue
    ? null
    : isResolvingPin
      ? 'Resolving service location...'
      : (locationNotice ??
        `Add ${formatMissingFields(missingFields)} to continue.`);

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
      continueLabel: isPreparingEstimate
        ? 'Getting estimate...'
        : 'Continue to Review',
      canVerifyAddress:
        Boolean(address.trim()) && busyAction !== 'geo-map-search',
      useCurrentLocationDisabled: busyAction === 'geo-current-location',
      verifyAddressDisabled: !address.trim() || busyAction === 'geo-map-search',
      saveAddressDisabled:
        !address.trim() ||
        !serviceLocation.confirmedPin ||
        busyAction === 'save-address',
      useCurrentLocationLabel:
        busyAction === 'geo-current-location' ? 'Locating...' : 'Use current',
      verifyAddressLabel: resolveMapActionLabel(
        serviceLocation,
        busyAction,
        selectedSavedAddressLabel,
      ),
      saveAddressLabel: resolveSaveHomeLabel(
        serviceLocation,
        busyAction,
        selectedSavedAddress,
      ),
      locationNotice,
      locationStatusLabel,
      locationStatusActionLabel: locationStatusConfirmed ? 'Change' : 'Verify',
      locationStatusConfirmed,
      locationCoordinateLabel,
      savedAddressOptions: savedAddresses.map((item) => {
        const hasVerifiedPin = item.latitude !== null && item.longitude !== null;
        return {
          id: item.id,
          label: item.isDefault ? `${item.label} (default)` : item.label,
          address: item.address,
          hasVerifiedPin,
          isSelected: item.id === selectedSavedAddressId,
          statusLabel: hasVerifiedPin ? 'Verified pin' : 'Verify once',
        };
      }),
      footerRateLabel:
        provider.pricingMode === 'hourly'
          ? `${formatMoney(provider.price)} hourly base x ${duration}h`
          : 'Flat base rate',
      calloutFeeLabel: 'added on review',
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
  selectedSavedAddressLabel: string,
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
    return serviceLocation.source === 'saved'
      ? `${selectedSavedAddressLabel} pin verified`
      : 'Service pin confirmed';
  }

  if (serviceLocation.pendingPin) {
    return 'Pin ready to confirm';
  }

  if (serviceLocation.status === 'error') {
    return 'Manual address fallback';
  }

  if (serviceLocation.source === 'saved') {
    return `Verify ${selectedSavedAddressLabel} pin once`;
  }

  return 'Service pin required';
}

function resolveCustomerBookingLocationMeta(
  serviceLocation: CustomerBookingLocationState,
  notice: string | null,
  selectedSavedAddressLabel: string,
): string | null {
  if (serviceLocation.confirmedPin) {
    const coordinates = formatLocationCoordinates(serviceLocation.confirmedPin);
    return serviceLocation.source === 'saved'
      ? `${selectedSavedAddressLabel} is ready - ${coordinates}`
      : coordinates;
  }

  if (serviceLocation.pendingPin) {
    return `Review and confirm - ${formatLocationCoordinates(
      serviceLocation.pendingPin,
    )}`;
  }

  return notice;
}

function resolveMapActionLabel(
  serviceLocation: CustomerBookingLocationState,
  busyAction: string | null,
  selectedSavedAddressLabel: string,
): string {
  if (busyAction === 'geo-map-search') {
    return 'Searching...';
  }
  if (serviceLocation.confirmedPin) {
    return 'Change on map';
  }
  if (serviceLocation.source === 'saved') {
    return `Verify ${selectedSavedAddressLabel}`;
  }
  return 'Choose on map';
}

function resolveSaveHomeLabel(
  serviceLocation: CustomerBookingLocationState,
  busyAction: string | null,
  selectedSavedAddress: CustomerAddressSummary | null,
): string {
  if (busyAction === 'save-address') {
    return 'Saving...';
  }
  if (!serviceLocation.confirmedPin) {
    return 'Confirm pin to save Home';
  }
  if (
    selectedSavedAddress?.isDefault ||
    selectedSavedAddress?.label.trim().toLowerCase() === 'home'
  ) {
    return 'Update Home';
  }
  return 'Save as home';
}

function formatLocationCoordinates({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function formatMissingFields(missingFields: string[]): string {
  return missingFields.join(', ').replace(/, ([^,]*)$/, ' and $1');
}
