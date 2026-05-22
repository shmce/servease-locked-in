import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerBookingReviewViewModel } from './useCustomerBookingReviewViewModel';
import type {
  CustomerPaymentMethodSummary,
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
