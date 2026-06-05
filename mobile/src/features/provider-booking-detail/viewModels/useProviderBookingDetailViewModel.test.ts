import assert from 'node:assert/strict';
import test from 'node:test';
import type { BookingSummary, PaymentSummary } from '../../../shared/models/types';
import { buildProviderBookingDetailViewModel } from './useProviderBookingDetailViewModel';

function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    id: overrides.id ?? 'booking-1',
    bookingReference: overrides.bookingReference ?? 'SRV-001',
    customerId: overrides.customerId ?? 'customer-1',
    customerFullName: overrides.customerFullName ?? 'Maria Santos',
    providerId: overrides.providerId ?? 'provider-1',
    providerBusinessName: overrides.providerBusinessName ?? 'GreenFix Home Services',
    serviceId: overrides.serviceId ?? 'service-1',
    serviceTitle: overrides.serviceTitle ?? 'Deep Cleaning',
    serviceAddress: overrides.serviceAddress ?? 'Makati',
    scheduledAt: overrides.scheduledAt ?? '2026-05-20T14:00:00+08:00',
    status: overrides.status ?? 'confirmed',
    totalAmount: overrides.totalAmount ?? 1200,
  };
}

function payment(overrides: Partial<PaymentSummary> = {}): PaymentSummary {
  return {
    id: overrides.id ?? 'payment-1',
    bookingId: overrides.bookingId ?? 'booking-1',
    customerId: overrides.customerId ?? 'customer-1',
    providerId: overrides.providerId ?? 'provider-1',
    amount: overrides.amount ?? 1200,
    platformFee: overrides.platformFee ?? 180,
    providerPayout: overrides.providerPayout ?? 1020,
    status: overrides.status ?? 'paid',
    paymentMethod: overrides.paymentMethod ?? 'cash_on_service',
    paidAt: overrides.paidAt ?? null,
    createdAt: overrides.createdAt ?? null,
  };
}

test('provider booking detail keeps start service available for confirmed bookings', () => {
  const model = buildProviderBookingDetailViewModel({
    booking: booking({ scheduledAt: '2026-05-20T14:00:00+08:00' }),
    busyAction: null,
    selectedPayment: null,
  });
  const startAction = model.data.statusActions.find(
    (action) => action.action === 'startService',
  );

  assert.equal(startAction?.disabled, false);
  assert.equal(startAction?.label, 'Start Service');
});

test('provider booking detail shows start service loading state', () => {
  const model = buildProviderBookingDetailViewModel({
    booking: booking({ scheduledAt: '2026-05-20T14:00:00+08:00' }),
    busyAction: 'service-start',
    selectedPayment: null,
  });
  const startAction = model.data.statusActions.find(
    (action) => action.action === 'startService',
  );

  assert.equal(startAction?.disabled, true);
  assert.equal(startAction?.label, 'Starting...');
});

test('provider booking detail does not label customer total as provider payout without payment data', () => {
  const model = buildProviderBookingDetailViewModel({
    booking: booking({ totalAmount: 1500 }),
    busyAction: null,
    selectedPayment: null,
  });

  assert.equal(model.data.providerPayoutLabel, 'Payout pending');
  assert.ok(
    model.data.priceBreakdownRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'Payout pending',
    ),
  );
  assert.ok(
    model.data.priceBreakdownRows.some(
      (row) => row.label === 'Stored total' && row.value === 'PHP 1,500',
    ),
  );
});

test('provider booking detail shows platform fee and provider payout from payment data', () => {
  const model = buildProviderBookingDetailViewModel({
    booking: booking({ totalAmount: 1500 }),
    busyAction: null,
    selectedPayment: payment({
      amount: 1500,
      platformFee: 225,
      providerPayout: 1275,
    }),
  });

  assert.equal(model.data.providerPayoutLabel, 'PHP 1,275');
  assert.ok(
    model.data.priceBreakdownRows.some(
      (row) => row.label === 'Platform fee' && row.value === 'PHP 225',
    ),
  );
  assert.ok(
    model.data.priceBreakdownRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'PHP 1,275',
    ),
  );
});
