import assert from 'node:assert/strict';
import test from 'node:test';
import type { BookingSummary } from '../../../shared/models/types';
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
