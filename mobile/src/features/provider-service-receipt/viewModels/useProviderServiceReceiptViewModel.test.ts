import assert from 'node:assert/strict';
import test from 'node:test';
import type { BookingSummary, PaymentSummary } from '../../../shared/models/types';
import { buildProviderServiceReceiptViewModel } from './useProviderServiceReceiptViewModel';

const booking = {
  id: 'booking-1',
  bookingReference: 'SRV-001',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceTitle: 'Cleaning',
  serviceAddress: 'Makati',
  scheduledAt: '2026-05-21T08:00:00.000Z',
  totalAmount: 1200,
  pricingMode: 'flat',
  status: 'completed',
} as BookingSummary;

const payment: PaymentSummary = {
  id: 'payment-1',
  bookingId: 'booking-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  amount: 1200,
  platformFee: 180,
  providerPayout: 1020,
  status: 'paid',
  paymentMethod: 'cash_on_service',
  paidAt: null,
  createdAt: null,
};

test('provider receipt uses payment data for platform fee and payout', () => {
  const model = buildProviderServiceReceiptViewModel({
    booking,
    payment,
  });

  assert.equal(model.data.providerPayoutLabel, 'PHP 1,020');
  assert.ok(
    model.data.receiptRows.some(
      (row) => row.label === 'Platform fee' && row.value === 'PHP 180',
    ),
  );
  assert.ok(
    model.data.receiptRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'PHP 1,020',
    ),
  );
});

test('provider receipt does not use customer total as payout when payment is missing', () => {
  const model = buildProviderServiceReceiptViewModel({
    booking,
    payment: null,
  });

  assert.equal(model.data.providerPayoutLabel, 'Payout pending');
  assert.ok(
    model.data.receiptRows.some(
      (row) => row.label === 'Platform fee' && row.value === 'Pending',
    ),
  );
  assert.ok(
    model.data.receiptRows.some(
      (row) => row.label === 'Provider payout' && row.value === 'Payout pending',
    ),
  );
});
