import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerBookingReviewViewModel } from './useCustomerBookingReviewViewModel';
import { customerPastSlotPickerCopy } from '../../../shared/utils/booking';
import type {
  BookingPricePreviewSummary,
  CustomerPaymentMethodSummary,
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

const preview: BookingPricePreviewSummary = {
  currency: 'PHP',
  serviceAmount: 500,
  totalAmount: 651,
  pricingMode: 'flat',
  serviceTitle: 'Home repair',
  serviceDescription: 'General repairs',
  materialDriftTolerance: 10,
  priceBreakdown: {
    currency: 'PHP',
    serviceSubtotal: 500,
    travelFee: 120,
    serviceFee: 31,
    total: 651,
    fallbackUsed: true,
    calculationSource: 'fallback',
    generatedAt: '2026-05-31T00:00:00.000Z',
    metadata: {
      pricingMode: 'flat',
      hoursRequired: 1,
      serviceRate: 500,
      distanceKm: null,
      durationMinutes: null,
      fallbackReason: 'route_unavailable',
    },
    lineItems: [
      {
        code: 'service_subtotal',
        label: 'Service subtotal',
        amount: 500,
        source: 'provider_rate',
      },
      {
        code: 'travel_fuel',
        label: 'Travel and fuel estimate',
        amount: 120,
        source: 'fallback',
      },
      {
        code: 'service_fee',
        label: 'Platform fee',
        amount: 31,
        source: 'platform_fee',
      },
    ],
  },
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
    bookingPricePreview: preview,
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
    bookingPricePreview: preview,
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
  const bookingPricePreview: BookingPricePreviewSummary = {
    currency: 'PHP',
    serviceAmount: 2000,
    totalAmount: 2251,
    pricingMode: 'flat',
    serviceTitle: 'Home repair',
    serviceDescription: 'General repairs',
    materialDriftTolerance: 22.51,
    priceBreakdown: {
      currency: 'PHP',
      serviceSubtotal: 2000,
      travelFee: 144,
      serviceFee: 107,
      total: 2251,
      fallbackUsed: true,
      calculationSource: 'fallback',
      generatedAt: '2026-05-31T00:00:00.000Z',
      metadata: {
        pricingMode: 'flat',
        hoursRequired: 1,
        serviceRate: 2000,
        distanceKm: null,
        durationMinutes: null,
        fallbackReason: 'route_unavailable',
      },
      lineItems: [
        {
          code: 'service_subtotal',
          label: 'Service subtotal',
          amount: 2000,
          source: 'provider_rate',
        },
        {
          code: 'travel_fuel',
          label: 'Travel and fuel estimate',
          amount: 144,
          source: 'fallback',
        },
        {
          code: 'service_fee',
          label: 'Platform fee',
          amount: 107,
          source: 'platform_fee',
        },
      ],
    },
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
    bookingPricePreview,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  assert.equal(model.data.totalLabel, 'Customer total');
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
      label: 'Platform fee',
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
    bookingPricePreview: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  assert.equal(model.data.confirmDisabled, true);
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
      label: 'Platform fee',
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
    bookingPricePreview: preview,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-06-03T07:00:00.000Z'),
  });

  assert.equal(model.data.confirmDisabled, true);
  assert.equal(model.data.priceNotice, customerPastSlotPickerCopy);
});

test('customer booking review surfaces final schedule submission failures inline without disabling retry', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
    serviceLocation: confirmedServiceLocation,
    notes: '',
    bookingReferencePhotoUrl: null,
    bookingPricePreview: preview,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    bookingSlotError: 'This slot was just taken or blocked. Please pick another.',
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
    now: new Date('2026-05-31T00:00:00.000Z'),
  });

  assert.equal(model.data.confirmDisabled, false);
  assert.equal(
    model.data.priceNotice,
    'This slot was just taken or blocked. Please pick another.',
  );
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
    bookingPricePreview: preview,
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
  assert.equal(
    pinRow?.value,
    'Verified saved pin - 14.55473, 121.02445',
  );
  assert.equal(model.data.confirmDisabled, false);
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
    bookingPricePreview: preview,
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
  assert.equal(model.data.priceNotice, customerMapPinRequiredCopy);
  assert.equal(pinRow?.value, 'Pin not confirmed');
});
