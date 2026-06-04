import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCustomerBookingLocationState,
  customerBookingLocationFromSavedAddress,
  customerMapSavedPinRequiredCopy,
} from '../../../domain/customerBookingLocation';
import type {
  CustomerAddressSummary,
  ProviderAvailabilitySchedule,
  ProviderListing,
} from '../../../shared/models/types';
import { buildCustomerBookingFormViewModel } from './useCustomerBookingFormViewModel';

const provider = {
  id: 'listing-1',
  providerId: 'provider-1',
  providerBusinessName: 'Fix Masters',
  title: 'Home repair',
  description: 'General repairs',
  serviceId: 'service-1',
  price: 500,
  pricingMode: 'flat',
  averageRating: 4.8,
  reviewCount: 12,
} as ProviderListing;

const providerAvailability: ProviderAvailabilitySchedule = {
  providerId: 'provider-1',
  windows: [
    {
      id: 'window-1',
      dayOfWeek: 'wednesday',
      startTime: '08:00',
      endTime: '18:00',
      isActive: true,
      sortOrder: 1,
    },
  ],
  daysOff: [],
  timeOffWindows: [],
};

const verifiedHomeAddress: CustomerAddressSummary = {
  id: 'address-home',
  userId: 'customer-1',
  label: 'Home',
  address: 'The Beacon, Makati',
  barangay: null,
  city: 'Makati',
  province: null,
  region: 'NCR',
  latitude: 14.554729,
  longitude: 121.024445,
  isDefault: true,
  createdAt: null,
  updatedAt: null,
};

const unverifiedHomeAddress: CustomerAddressSummary = {
  ...verifiedHomeAddress,
  latitude: null,
  longitude: null,
};

test('booking form treats a verified saved Home pin as ready to continue', () => {
  const model = buildCustomerBookingFormViewModel({
    provider,
    providerAvailability,
    scheduledAt: '2026-06-03T16:00',
    hoursRequired: '1',
    timeSlots: ['16:00'],
    bookingSlotError: '',
    address: verifiedHomeAddress.address,
    serviceLocation: customerBookingLocationFromSavedAddress(verifiedHomeAddress),
    savedAddresses: [verifiedHomeAddress],
    selectedSavedAddressId: verifiedHomeAddress.id,
    bookingReferencePhotoUrl: null,
    busyAction: null,
    pinAddressStatus: 'idle',
    now: new Date('2026-06-03T07:00:00.000Z'),
  });

  assert.equal(model.data.canContinue, true);
  assert.equal(model.data.locationStatusLabel, 'Home pin verified');
  assert.equal(model.data.locationStatusActionLabel, 'Change');
  assert.equal(model.data.locationStatusConfirmed, true);
  assert.equal(model.data.verifyAddressLabel, 'Change on map');
  assert.equal(model.data.saveAddressLabel, 'Update Home');
  assert.equal(model.data.savedAddressOptions[0]?.hasVerifiedPin, true);
  assert.equal(model.data.savedAddressOptions[0]?.statusLabel, 'Verified pin');
  assert.match(model.data.locationCoordinateLabel ?? '', /Home is ready/);
});

test('booking form asks for one-time verification on a saved Home without coordinates', () => {
  const model = buildCustomerBookingFormViewModel({
    provider,
    providerAvailability,
    scheduledAt: '2026-06-03T16:00',
    hoursRequired: '1',
    timeSlots: ['16:00'],
    bookingSlotError: '',
    address: unverifiedHomeAddress.address,
    serviceLocation: customerBookingLocationFromSavedAddress(
      unverifiedHomeAddress,
    ),
    savedAddresses: [unverifiedHomeAddress],
    selectedSavedAddressId: unverifiedHomeAddress.id,
    bookingReferencePhotoUrl: null,
    busyAction: null,
    pinAddressStatus: 'idle',
    now: new Date('2026-06-03T07:00:00.000Z'),
  });

  assert.equal(model.data.canContinue, false);
  assert.equal(model.data.locationStatusLabel, 'Verify Home pin once');
  assert.equal(model.data.locationStatusActionLabel, 'Verify');
  assert.equal(model.data.locationStatusConfirmed, false);
  assert.equal(model.data.locationNotice, customerMapSavedPinRequiredCopy);
  assert.equal(model.data.continueNotice, customerMapSavedPinRequiredCopy);
  assert.equal(model.data.verifyAddressLabel, 'Verify Home');
  assert.equal(model.data.saveAddressDisabled, true);
  assert.equal(model.data.saveAddressLabel, 'Confirm pin to save Home');
  assert.equal(model.data.savedAddressOptions[0]?.hasVerifiedPin, false);
  assert.equal(model.data.savedAddressOptions[0]?.statusLabel, 'Verify once');
});

test('booking form keeps manually edited addresses blocked until a pin is confirmed', () => {
  const model = buildCustomerBookingFormViewModel({
    provider,
    providerAvailability,
    scheduledAt: '2026-06-03T16:00',
    hoursRequired: '1',
    timeSlots: ['16:00'],
    bookingSlotError: '',
    address: 'Manual address',
    serviceLocation: createCustomerBookingLocationState('Manual address'),
    savedAddresses: [],
    selectedSavedAddressId: null,
    bookingReferencePhotoUrl: null,
    busyAction: null,
    pinAddressStatus: 'idle',
    now: new Date('2026-06-03T07:00:00.000Z'),
  });

  assert.equal(model.data.canContinue, false);
  assert.equal(model.data.locationStatusLabel, 'Service pin required');
  assert.equal(model.data.verifyAddressLabel, 'Choose on map');
  assert.equal(model.data.saveAddressDisabled, true);
});
