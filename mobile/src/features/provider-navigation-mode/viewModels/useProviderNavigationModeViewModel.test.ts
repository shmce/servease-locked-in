import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  BookingSummary,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
} from '../../../shared/models/types';
import { buildProviderNavigationModeViewModel } from './useProviderNavigationModeViewModel';

const booking = {
  id: 'booking-1',
  bookingReference: 'SRV-001',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceTitle: 'Cleaning',
  serviceAddress: 'Makati',
  serviceLatitude: 14.5547,
  serviceLongitude: 121.0244,
  scheduledAt: '2026-05-21T08:00:00.000Z',
  status: 'confirmed',
  totalAmount: 1500,
} as BookingSummary;

const tracking: BookingTrackingSnapshot = {
  bookingId: 'booking-1',
  bookingReference: 'SRV-001',
  status: 'confirmed',
  phase: 'scheduled',
  etaMinutes: 14,
  distanceKm: 4.2,
  trafficLevel: 'moderate',
  destinationAddress: 'Makati',
  destinationLocation: {
    latitude: 14.5547,
    longitude: 121.0244,
  },
  providerLocation: null,
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

test('provider navigation labels stored destinations as confirmed service pins', () => {
  const model = buildProviderNavigationModeViewModel({
    booking,
    directions,
    fallbackOrigin: { latitude: 14.5794, longitude: 121.0359 },
    liveLocation: {
      error: null,
      isPublishing: false,
      location: null,
    },
    navigationRouteError: null,
    navigationRouteLoading: false,
    sheetLevel: 'half',
    trackingSnapshot: tracking,
  });

  assert.equal(model.data.destinationMarkerLabel, 'Confirmed service pin');
  assert.equal(model.data.routeLabel, '4.2 km - 14 min');
});

test('provider navigation keeps legacy address marker copy without stored coordinates', () => {
  const model = buildProviderNavigationModeViewModel({
    booking: {
      ...booking,
      serviceLatitude: null,
      serviceLongitude: null,
    },
    directions: null,
    fallbackOrigin: null,
    liveLocation: {
      error: null,
      isPublishing: false,
      location: null,
    },
    navigationRouteError: null,
    navigationRouteLoading: false,
    sheetLevel: 'peek',
    trackingSnapshot: {
      ...tracking,
      destinationLocation: null,
    },
  });

  assert.equal(model.data.destinationMarkerLabel, 'Service address');
});
