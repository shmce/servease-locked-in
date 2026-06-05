import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  confirmCustomerBookingPin,
  createCustomerBookingLocationState,
  customerBookingLocationCanContinue,
  customerBookingLocationFromSavedAddress,
  customerBookingLocationNotice,
  customerMapPinFallbackCopy,
  customerMapPinRequiredCopy,
  customerMapSavedPinRequiredCopy,
  failCustomerBookingLocationResolution,
  moveCustomerBookingPendingPin,
  startCustomerBookingPendingPin,
  updateCustomerBookingLocationAddress,
} from './customerBookingLocation';

describe('customerBookingLocation', () => {
  it('tracks a confirmed map pin from a saved address with coordinates', () => {
    const state = customerBookingLocationFromSavedAddress({
      id: 'address-1',
      userId: 'customer-1',
      label: 'Home',
      address: 'The Beacon, Makati',
      barangay: null,
      city: 'Makati',
      province: null,
      region: 'NCR',
      latitude: 14.554729,
      longitude: 121.024445,
      isDefault: true,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    });

    assert.equal(state.status, 'confirmed');
    assert.equal(customerBookingLocationCanContinue(state), true);
    assert.deepEqual(state.confirmedPin, {
      formattedAddress: 'The Beacon, Makati',
      latitude: 14.554729,
      longitude: 121.024445,
      source: 'saved',
    });
  });

  it('keeps saved addresses without coordinates unconfirmed for one-time verification', () => {
    const state = customerBookingLocationFromSavedAddress({
      id: 'address-1',
      userId: 'customer-1',
      label: 'Home',
      address: 'The Beacon, Makati',
      barangay: null,
      city: 'Makati',
      province: null,
      region: 'NCR',
      latitude: null,
      longitude: null,
      isDefault: true,
      createdAt: null,
      updatedAt: null,
    });

    assert.equal(state.source, 'saved');
    assert.equal(state.status, 'unconfirmed');
    assert.equal(customerBookingLocationCanContinue(state), false);
    assert.equal(
      customerBookingLocationNotice(state),
      customerMapSavedPinRequiredCopy,
    );
  });

  it('clears a confirmed pin when address text changes', () => {
    const confirmed = customerBookingLocationFromSavedAddress({
      id: 'address-1',
      userId: 'customer-1',
      label: 'Home',
      address: 'The Beacon, Makati',
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

    const stale = updateCustomerBookingLocationAddress(
      confirmed,
      'The Beacon Tower 2, Makati',
    );

    assert.equal(stale.status, 'stale');
    assert.equal(stale.confirmedPin, null);
    assert.equal(customerBookingLocationNotice(stale), customerMapPinRequiredCopy);
  });

  it('supports pending search pins, manual movement, and confirmation output', () => {
    const pending = startCustomerBookingPendingPin(
      createCustomerBookingLocationState('The Beacon'),
      {
        formattedAddress: 'The Beacon, Chino Roces Makati',
        latitude: 14.5547,
        longitude: 121.0244,
        provider: 'google-maps',
      },
      'search',
    );
    const moved = moveCustomerBookingPendingPin(
      pending,
      14.5548,
      121.0245,
      'Gate 2, The Beacon',
    );
    const confirmed = confirmCustomerBookingPin(moved, 'Gate 2, The Beacon');

    assert.equal(confirmed.status, 'confirmed');
    assert.deepEqual(confirmed.confirmedPin, {
      formattedAddress: 'Gate 2, The Beacon',
      latitude: 14.5548,
      longitude: 121.0245,
      source: 'search',
    });
  });

  it('does not make a confirmed saved pin pending when the map reports the same center', () => {
    const confirmed = customerBookingLocationFromSavedAddress({
      id: 'address-1',
      userId: 'customer-1',
      label: 'Home',
      address: 'The Beacon, Makati',
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

    const inspected = moveCustomerBookingPendingPin(
      confirmed,
      14.554729,
      121.024445,
      'The Beacon, Makati',
    );

    assert.equal(inspected, confirmed);
    assert.equal(inspected.status, 'confirmed');
    assert.equal(customerBookingLocationCanContinue(inspected), true);
  });

  it('makes a verified saved pin pending when the customer moves the map', () => {
    const confirmed = customerBookingLocationFromSavedAddress({
      id: 'address-1',
      userId: 'customer-1',
      label: 'Home',
      address: 'The Beacon, Makati',
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

    const moved = moveCustomerBookingPendingPin(
      confirmed,
      14.5548,
      121.0245,
      'Gate 2, The Beacon',
    );

    assert.equal(moved.status, 'pending');
    assert.equal(moved.source, 'manual');
    assert.equal(customerBookingLocationCanContinue(moved), false);
    assert.deepEqual(moved.pendingPin, {
      formattedAddress: 'Gate 2, The Beacon',
      latitude: 14.5548,
      longitude: 121.0245,
      source: 'manual',
    });
  });

  it('returns fallback copy when geo resolution fails', () => {
    const failed = failCustomerBookingLocationResolution(
      createCustomerBookingLocationState('Manual address'),
      'Geocoder unavailable',
    );

    assert.equal(failed.status, 'error');
    assert.equal(customerBookingLocationNotice(failed), customerMapPinFallbackCopy);
  });
});
