import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerBookingReviewViewModel } from './useCustomerBookingReviewViewModel';
import { customerPastSlotPickerCopy } from '../../../shared/utils/booking';
import type {
  CustomerPaymentMethodSummary,
  PricingQuoteSummary,
  ProviderListing,
} from '../../../shared/models/types';
import {
  customerBookingLocationFromSavedAddress,
  customerMapPinRequiredCopy,
} from '../../../domain/customerBookingLocation';

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

const cashMethod: CustomerPaymentMethodSummary = {
  id: 'method-cash',
  customerId: 'customer-1',
  methodType: 'cash_on_service',
  label: 'Cash on service',
  brand: 'Cash',
  last4: null,
  isDefault: true,
  createdAt: null,
};

const gcashMethod: CustomerPaymentMethodSummary = {
  id: 'method-gcash',
  customerId: 'customer-1',
  methodType: 'gcash',
  label: 'GCash checkout',
  brand: null,
  last4: null,
  isDefault: false,
  createdAt: null,
};

const confirmedServiceLocation = customerBookingLocationFromSavedAddress({
  id: 'address-1',
  userId: 'customer-1',
  label: 'Home',
  address: '123 Test St',
  barangay: null,
  city: 'Makati',
  province: null,
  region: 'NCR',
  latitude: 14.554729,
  longitude: 121.024445,
  isDefault: true,
  createdAt: null,
  updatedAt: null,
});

test('customer booking review shows payment-first cash confirmation copy', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod, gcashMethod],
    selectedPaymentMethodId: cashMethod.id,
  });

  assert.equal(model.data.confirmLabel, 'Confirm cash booking');
  assert.equal(model.data.paymentMethodRows[0]?.label, 'Cash on service');
  assert.equal(model.data.paymentMethodRows[0]?.selected, true);
  assert.match(model.data.paymentNotice, /cash/i);
});

test('customer booking review shows secure checkout copy for online methods', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod, gcashMethod],
    selectedPaymentMethodId: gcashMethod.id,
  });

  assert.equal(model.data.confirmLabel, 'Pay and confirm booking');
  assert.equal(model.data.paymentMethodRows[1]?.label, 'GCash checkout');
  assert.equal(model.data.paymentMethodRows[1]?.selected, true);
  assert.match(model.data.paymentNotice, /secure checkout/i);
});

test('customer booking review shows booking-facing price breakdown rows', () => {
  const quote: PricingQuoteSummary = {
    quoteId: 'quote-1',
    expiresAt: '2026-06-01T08:45:00.000Z',
    currency: 'PHP',
    estimatedTotal: 2144,
    fairRangeMin: 1822,
    fairRangeMax: 2466,
    fairnessStatus: 'within_range',
    confidence: 'medium',
    lineItems: [
      { code: 'labor', label: 'Labor', amount: 2000 },
      { code: 'travel_fuel', label: 'Travel and fuel estimate', amount: 144 },
    ],
    signals: {
      distanceKm: null,
      durationMinutes: null,
      fuelPricePerLiter: 89.84,
      fuelIndexUpdatedAt: '2026-05-19T00:00:00.000Z',
      staleFuelIndex: false,
      fallbackUsed: true,
    },
    explanation: 'Within typical rates.',
  };
  const model = buildCustomerBookingReviewViewModel({
    provider: {
      ...provider,
      price: 1575,
    },
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '1',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: quote,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  assert.equal(model.data.totalLabel, 'Booking total estimate');
  assert.equal(model.data.displayedTotalLabel, 'PHP 2,251');
  assert.deepEqual(model.data.priceBreakdownRows.slice(0, 3), [
    {
      key: 'service-subtotal',
      label: 'Service subtotal',
      value: 'PHP 2,000',
    },
    {
      key: 'travel-fuel',
      label: 'Travel and fuel estimate',
      value: 'PHP 144',
    },
    {
      key: 'service-fee',
      label: 'Service fee',
      value: 'PHP 107',
    },
  ]);
});

test('customer booking review shows fallback breakdown and allows cash confirmation without a quote', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '1',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  assert.equal(model.data.confirmDisabled, false);
  assert.equal(model.data.displayedTotalLabel, 'PHP 651');
  assert.deepEqual(model.data.priceBreakdownRows, [
    {
      key: 'service-subtotal',
      label: 'Service subtotal',
      value: 'PHP 500',
    },
    {
      key: 'travel-fuel',
      label: 'Travel and fuel estimate',
      value: 'PHP 120',
    },
    {
      key: 'service-fee',
      label: 'Service fee',
      value: 'PHP 31',
    },
  ]);
});

test('customer booking review blocks confirmation when the selected schedule has passed', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-03T10:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-06-03T07:00:00.000Z'),
  });

  assert.equal(model.data.confirmDisabled, true);
  assert.equal(model.data.quoteExplanation, customerPastSlotPickerCopy);
});

test('customer booking review shows the confirmed service pin', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
  });

  const pinRow = model.data.serviceRows.find(
    (row) => row.key === 'service-pin',
  );
  assert.match(pinRow?.value ?? '', /14.55473, 121.02445/);
});

test('customer booking review blocks confirmation when the service pin regresses to pending', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: {
      ...confirmedServiceLocation,
      pendingPin: confirmedServiceLocation.confirmedPin,
      status: 'pending',
    },
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  const pinRow = model.data.serviceRows.find(
    (row) => row.key === 'service-pin',
  );
  assert.equal(model.data.confirmDisabled, true);
  assert.equal(model.data.quoteExplanation, customerMapPinRequiredCopy);
  assert.equal(pinRow?.value, 'Pin not confirmed');
});
