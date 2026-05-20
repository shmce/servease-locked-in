import { useMemo } from 'react';
import {
  BookingSummary,
  BookingTrackingSnapshot,
} from '../../../shared/models/types';
import {
  formatDateTime,
  statusLabel,
} from '../../../shared/utils/booking';

export type CustomerTrackingSheetLevel = 'peek' | 'half' | 'expanded';

type CustomerTrackProviderViewModelInput = {
  booking: BookingSummary;
  trackingSnapshot: BookingTrackingSnapshot | null;
  sheetLevel: CustomerTrackingSheetLevel;
};

export function useCustomerTrackProviderViewModel({
  booking,
  trackingSnapshot,
  sheetLevel,
}: CustomerTrackProviderViewModelInput) {
  return useMemo(
    () =>
      buildCustomerTrackProviderViewModel({
        booking,
        trackingSnapshot,
        sheetLevel,
      }),
    [booking, sheetLevel, trackingSnapshot],
  );
}

export function buildCustomerTrackProviderViewModel({
  booking,
  trackingSnapshot,
  sheetLevel,
}: CustomerTrackProviderViewModelInput) {
  const tracking =
    trackingSnapshot?.bookingId === booking.id ? trackingSnapshot : null;
  const isHalfSheet = sheetLevel !== 'peek';
  const isExpandedSheet = sheetLevel === 'expanded';

  return {
    data: {
      addressLabel:
        tracking?.destinationAddress ?? booking.serviceAddress ?? 'Address unavailable',
      isExpandedSheet,
      isHalfSheet,
      lastUpdateLabel: tracking?.lastUpdatedAt
        ? formatDateTime(tracking.lastUpdatedAt)
        : 'Loading',
      scheduleLabel: formatDateTime(booking.scheduledAt),
      tracking,
      phaseTitle: trackingPhaseTitle(tracking),
      routeLabel: trackingRouteLabel(tracking),
    },
    isLoading: false,
    error: null,
  };
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
