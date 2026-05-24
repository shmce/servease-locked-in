import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerBookingReviewViewModel } from './useCustomerBookingReviewViewModel';
import type {
  CustomerPaymentMethodSummary,
  PricingQuoteSummary,
  ProviderListing,
} from '../../../shared/models/types';

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

test('customer booking review shows payment-first cash confirmation copy', () => {
  const model = buildCustomerBookingReviewViewModel({
    provider,
    selectedService: null,
    scheduledAt: '2026-06-01T09:00',
    hoursRequired: '2',
    address: '123 Test St',
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

test('customer booking review separates provider rate from pricing engine total', () => {
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
    notes: '',
    bookingReferencePhotoUrl: null,
    pricingQuote: quote,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    customerPaymentMethods: [cashMethod],
    selectedPaymentMethodId: cashMethod.id,
  });

  assert.equal(model.data.totalLabel, 'Pricing engine estimate');
  assert.equal(model.data.displayedTotalLabel, 'PHP 2,144');
  assert.deepEqual(model.data.priceBreakdownRows.slice(0, 3), [
    {
      key: 'provider-rate',
      label: 'Provider rate',
      value: 'PHP 1,575',
    },
    {
      key: 'fair-range',
      label: 'Fair range',
      value: 'PHP 1,822 - PHP 2,466',
    },
    {
      key: 'fairness',
      label: 'Fairness',
      value: 'Within fair range',
    },
  ]);
});
