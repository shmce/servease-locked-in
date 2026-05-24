import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasBlockingActiveProviderBooking,
  providerOperationalLockBlocksTransition,
} from './providerOperationalLock';
import type { BookingSummary } from '../shared/models/types';

function booking(
  id: string,
  status: BookingSummary['status'],
): BookingSummary {
  return {
    id,
    bookingReference: `SRV-${id}`,
    customerId: `customer-${id}`,
    providerId: 'provider-1',
    serviceId: 'service-1',
    serviceTitle: 'Home Service',
    status,
    scheduledAt: '2026-05-20T09:00:00.000Z',
    serviceAddress: 'Makati City',
    totalAmount: 1200,
  };
}

describe('provider operational lock', () => {
  it('detects a different active on-the-way booking', () => {
    assert.equal(
      hasBlockingActiveProviderBooking(
        [booking('active', 'in_progress'), booking('pending', 'pending')],
        'pending',
      ),
      true,
    );
  });

  it('blocks accepting another booking while one is on the way', () => {
    const pending = booking('pending', 'pending');

    assert.equal(
      providerOperationalLockBlocksTransition(
        [booking('active', 'in_progress'), pending],
        pending,
        'confirmed',
      ),
      true,
    );
  });

  it('does not block completing the active on-the-way booking', () => {
    const active = booking('active', 'in_progress');

    assert.equal(
      providerOperationalLockBlocksTransition([active], active, 'completed'),
      false,
    );
  });
});
