import { useMemo } from 'react';
import {
  BookingTrackingLocation,
  BookingSummary,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
} from '../../../shared/models/types';
import {
  formatDateTime,
  statusLabel,
} from '../../../shared/utils/booking';

export type CustomerTrackingSheetLevel = 'peek' | 'half' | 'expanded';

type CustomerTrackProviderViewModelInput = {
  booking: BookingSummary;
  directions: GeoDirectionsRoute | null;
  navigationRouteError: string | null;
  navigationRouteLoading: boolean;
  trackingSnapshot: BookingTrackingSnapshot | null;
  sheetLevel: CustomerTrackingSheetLevel;
};

export function useCustomerTrackProviderViewModel({
  booking,
  directions,
  navigationRouteError,
  navigationRouteLoading,
  trackingSnapshot,
  sheetLevel,
}: CustomerTrackProviderViewModelInput) {
  return useMemo(
    () =>
      buildCustomerTrackProviderViewModel({
        booking,
        directions,
        navigationRouteError,
        navigationRouteLoading,
        trackingSnapshot,
        sheetLevel,
      }),
    [booking, directions, navigationRouteError, navigationRouteLoading, sheetLevel, trackingSnapshot],
  );
}

export function buildCustomerTrackProviderViewModel({
  booking,
  directions,
  navigationRouteError,
  navigationRouteLoading,
  trackingSnapshot,
  sheetLevel,
}: CustomerTrackProviderViewModelInput) {
  const tracking =
    trackingSnapshot?.bookingId === booking.id ? trackingSnapshot : null;
  const navigationOrigin = tracking?.providerLocation ?? null;
  const isHalfSheet = sheetLevel !== 'peek';
  const isExpandedSheet = sheetLevel === 'expanded';

  return {
    data: {
      addressLabel:
        tracking?.destinationAddress ?? booking.serviceAddress ?? 'Address unavailable',
      destinationMarkerLabel: tracking?.destinationLocation
        ? 'Confirmed service pin'
        : 'Service address',
      distanceLabel: directions ? formatRouteDistance(directions.distanceMeters) : '--',
      isExpandedSheet,
      isHalfSheet,
      lastUpdateLabel: tracking?.lastUpdatedAt
        ? formatDateTime(tracking.lastUpdatedAt)
        : 'Loading',
      navigationOrigin,
      providerLocationLabel: providerLocationStatusLabel(
        navigationOrigin,
        navigationRouteLoading,
      ),
      routeDurationLabel: directions
        ? formatRouteDuration(directions.durationSeconds)
        : '--',
      scheduleLabel: formatDateTime(booking.scheduledAt),
      tracking,
      phaseTitle: trackingPhaseTitle(tracking),
      routeLabel: customerDirectionsLabel(
        directions,
        navigationRouteLoading,
        navigationRouteError,
        tracking,
      ),
    },
    isLoading: false,
    error: null,
  };
}

function customerDirectionsLabel(
  directions: GeoDirectionsRoute | null,
  loading: boolean,
  error: string | null,
  tracking: BookingTrackingSnapshot | null,
): string {
  if (loading) {
    return 'Loading provider route';
  }
  if (directions) {
    return `${formatRouteDistance(directions.distanceMeters)} - ${formatRouteDuration(
      directions.durationSeconds,
    )}`;
  }
  return error ?? trackingRouteLabel(tracking);
}

function trackingPhaseTitle(tracking: BookingTrackingSnapshot | null): string {
  switch (tracking?.phase) {
    case 'awaiting_confirmation':
      return 'Awaiting provider confirmation';
    case 'scheduled':
      return 'Provider is scheduled';
    case 'on_the_way':
      return 'Provider is on the way';
    case 'completed':
      return 'Service completed';
    case 'cancelled':
      return 'Booking cancelled';
    case 'rejected':
      return 'Booking declined';
    default:
      return 'Loading route estimate';
  }
}

function trackingRouteLabel(tracking: BookingTrackingSnapshot | null): string {
  if (!tracking) {
    return 'Route preview loading';
  }

  const routeParts = [
    tracking.distanceKm === null ? null : `${tracking.distanceKm.toFixed(1)} km`,
    tracking.trafficLevel ? `${tracking.trafficLevel} traffic` : null,
  ].filter(Boolean);

  return routeParts.length ? routeParts.join(' - ') : statusLabel(tracking.status);
}

function providerLocationStatusLabel(
  providerLocation: BookingTrackingLocation | null,
  loading: boolean,
): string {
  if (loading) {
    return 'Updating';
  }
  if (!providerLocation) {
    return 'Waiting';
  }
  if (
    typeof providerLocation.accuracyMeters === 'number' &&
    providerLocation.accuracyMeters > 50
  ) {
    return 'Low GPS';
  }
  return 'Live';
}

function formatRouteDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
}

function formatRouteDuration(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}
