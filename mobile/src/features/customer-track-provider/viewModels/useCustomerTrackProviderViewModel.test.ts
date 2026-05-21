import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BookingSummary,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
} from '../../../shared/models/types';
import { buildCustomerTrackProviderViewModel } from './useCustomerTrackProviderViewModel';

const booking = {
  id: 'booking-1',
  bookingReference: 'SRV-001',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceTitle: 'Cleaning',
  serviceAddress: 'Makati',
  scheduledAt: '2026-05-21T08:00:00.000Z',
  status: 'confirmed',
  totalAmount: 1500,
} as BookingSummary;

const tracking: BookingTrackingSnapshot = {
  bookingId: 'booking-1',
  bookingReference: 'SRV-001',
  status: 'confirmed',
  phase: 'on_the_way',
  etaMinutes: 14,
  distanceKm: 4.2,
  trafficLevel: 'moderate',
  destinationAddress: 'Makati',
  destinationLocation: {
    latitude: 14.5547,
    longitude: 121.0244,
  },
  providerLocation: {
    latitude: 14.5794,
    longitude: 121.0359,
    accuracyMeters: 24,
  },
  scheduledAt: '2026-05-21T08:00:00.000Z',
  lastUpdatedAt: '2026-05-21T07:45:00.000Z',
};

const directions: GeoDirectionsRoute = {
  distanceMeters: 4200,
  durationSeconds: 840,
  geometry: [
    { latitude: 14.5794, longitude: 121.0359 },
    { latitude: 14.5547, longitude: 121.0244 },
  ],
  steps: [],
  provider: 'openrouteservice',
};

test('customer tracking exposes navigation-style route stats from provider directions', () => {
  const model = buildCustomerTrackProviderViewModel({
    booking,
    directions,
    navigationRouteError: null,
    navigationRouteLoading: false,
    sheetLevel: 'half',
    trackingSnapshot: tracking,
  });

  assert.equal(model.data.routeDurationLabel, '14 min');
  assert.equal(model.data.distanceLabel, '4.2 km');
  assert.equal(model.data.providerLocationLabel, 'Live');
  assert.equal(model.data.routeLabel, '4.2 km - 14 min');
  assert.deepEqual(model.data.navigationOrigin, tracking.providerLocation);
});

test('customer tracking keeps clear loading and unavailable route labels', () => {
  const loading = buildCustomerTrackProviderViewModel({
    booking,
    directions: null,
    navigationRouteError: null,
    navigationRouteLoading: true,
    sheetLevel: 'peek',
    trackingSnapshot: null,
  });
  const unavailable = buildCustomerTrackProviderViewModel({
    booking,
    directions: null,
    navigationRouteError: 'Provider location unavailable.',
    navigationRouteLoading: false,
    sheetLevel: 'peek',
    trackingSnapshot: null,
  });

  assert.equal(loading.data.routeLabel, 'Loading provider route');
  assert.equal(unavailable.data.routeLabel, 'Provider location unavailable.');
});
