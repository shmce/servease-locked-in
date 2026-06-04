import assert from 'node:assert/strict';
import test from 'node:test';
import type { BookingSummary } from '../../../shared/models/types';
import { buildProviderStartServiceViewModel } from './useProviderStartServiceViewModel';

const booking = {
  id: 'booking-1',
  bookingReference: 'SRV-001',
  customerId: 'customer-1',
  customerFullName: 'Maria Santos',
  providerId: 'provider-1',
  providerBusinessName: 'GreenFix Home Services',
  serviceId: 'service-1',
  serviceTitle: 'Deep Cleaning',
  serviceAddress: 'Makati',
  scheduledAt: '2026-05-20T14:00:00+08:00',
  status: 'confirmed',
  totalAmount: 1200,
} as BookingSummary;

const completeChecklist = {
  scopeConfirmed: true,
  toolsReady: true,
  instructionsReviewed: true,
};

test('provider start service shows the service-start loading state', () => {
  const model = buildProviderStartServiceViewModel({
    booking,
    beforePhotoUri: null,
    beforePhotoUrl: null,
    busyAction: 'service-start',
    checklist: completeChecklist,
  });

  assert.equal(model.data.startDisabled, true);
  assert.equal(model.data.startLabel, 'Starting...');
});

test('provider start service explains the checklist gate before enabling the button', () => {
  const model = buildProviderStartServiceViewModel({
    booking,
    beforePhotoUri: null,
    beforePhotoUrl: null,
    busyAction: null,
    checklist: {
      ...completeChecklist,
      toolsReady: false,
    },
  });

  assert.equal(model.data.startDisabled, true);
  assert.equal(model.data.startLabel, 'Complete checklist');
  assert.equal(model.data.startHelperLabel, 'Complete all checklist items to begin service.');
});
