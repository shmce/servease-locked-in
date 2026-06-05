import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProviderCompleteServiceViewModel } from './useProviderCompleteServiceViewModel';
import type { BookingSummary, PaymentSummary } from '../../../shared/models/types';

const booking = {
  id: 'booking-1',
  bookingReference: 'SRV-001',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceTitle: 'Cleaning',
  serviceDescription: null,
  serviceAddress: 'Makati',
  scheduledAt: '2026-05-21T08:00:00.000Z',
  hoursRequired: 2,
  totalAmount: 1000,
  pricingMode: 'flat',
  status: 'in_progress',
  customerNotes: null,
  providerBusinessName: 'Provider',
  customerFullName: 'Customer',
  customerContactNumber: null,
  attachments: [],
  createdAt: null,
} as BookingSummary;

const pendingOnlinePayment: PaymentSummary = {
  id: 'payment-1',
  bookingId: 'booking-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  amount: 1000,
  platformFee: 150,
  providerPayout: 850,
  status: 'pending',
  paymentMethod: 'gcash',
  paidAt: null,
  createdAt: null,
};

test('provider completion blocks unpaid online payments', () => {
  const model = buildProviderCompleteServiceViewModel({
    booking,
    busyAction: null,
    completionPhotoUri: null,
    completionPhotoUrl: null,
    payment: pendingOnlinePayment,
  });

  assert.equal(model.data.submitDisabled, true);
  assert.equal(model.data.submitLabel, 'Awaiting payment');
  assert.match(model.data.paymentNotice, /pending/);
  assert.ok(
    model.data.summaryRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'PHP 850',
    ),
  );
  assert.ok(
    model.data.summaryRows.some(
      (row) => row.label === 'Platform fee' && row.value === 'PHP 150',
    ),
  );
});

test('provider completion allows pending cash collection', () => {
  const model = buildProviderCompleteServiceViewModel({
    booking,
    busyAction: null,
    completionPhotoUri: null,
    completionPhotoUrl: null,
    payment: {
      ...pendingOnlinePayment,
      paymentMethod: 'cash_on_service',
    },
  });

  assert.equal(model.data.submitDisabled, false);
  assert.equal(model.data.submitLabel, 'Mark as Completed');
  assert.equal(model.data.paymentStatusLabel, 'Cash due on service');
  assert.ok(
    model.data.summaryRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'PHP 850',
    ),
  );
});

test('provider completion does not dead-end when payment state is still loading', () => {
  const model = buildProviderCompleteServiceViewModel({
    booking,
    busyAction: null,
    completionPhotoUri: null,
    completionPhotoUrl: null,
    payment: null,
  });

  assert.equal(model.data.submitDisabled, false);
  assert.equal(model.data.submitLabel, 'Mark as Completed');
  assert.match(model.data.paymentNotice, /backend/);
  assert.ok(
    model.data.summaryRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'Payout pending',
    ),
  );
  assert.ok(
    model.data.summaryRows.some(
      (row) => row.label === 'Platform fee' && row.value === 'Pending',
    ),
  );
});
