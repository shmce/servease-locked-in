import { useMemo } from 'react';
import {
  BookingSummary,
  BookingTrackingLocation,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
  GeoDirectionsStep,
  GeoRouteLocation,
} from '../../../shared/models/types';

export type ProviderNavigationSheetLevel = 'peek' | 'half' | 'expanded';

export type ProviderNavigationGuidance = {
  instruction: string;
  nextInstruction: string | null;
  distanceLabel: string;
  maneuverSymbol: string;
};

type ProviderLiveLocationState = {
  error: string | null;
  isPublishing: boolean;
  location: BookingTrackingLocation | null;
};

type ProviderNavigationModeViewModelInput = {
  booking: BookingSummary;
  directions: GeoDirectionsRoute | null;
  fallbackOrigin: BookingTrackingLocation | GeoRouteLocation | null;
  liveLocation: ProviderLiveLocationState;
  navigationRouteError: string | null;
  navigationRouteLoading: boolean;
  sheetLevel: ProviderNavigationSheetLevel;
  trackingSnapshot: BookingTrackingSnapshot | null;
};

export function useProviderNavigationModeViewModel({
  booking,
  directions,
  fallbackOrigin,
  liveLocation,
  navigationRouteError,
  navigationRouteLoading,
  sheetLevel,
  trackingSnapshot,
}: ProviderNavigationModeViewModelInput) {
  return useMemo(
    () =>
      buildProviderNavigationModeViewModel({
        booking,
        directions,
        fallbackOrigin,
        liveLocation,
        navigationRouteError,
        navigationRouteLoading,
        sheetLevel,
        trackingSnapshot,
      }),
    [
      booking,
      directions,
      fallbackOrigin,
      liveLocation,
      navigationRouteError,
      navigationRouteLoading,
      sheetLevel,
      trackingSnapshot,
    ],
  );
}

export function buildProviderNavigationModeViewModel({
  booking,
  directions,
  fallbackOrigin,
  liveLocation,
  navigationRouteError,
  navigationRouteLoading,
  sheetLevel,
  trackingSnapshot,
}: ProviderNavigationModeViewModelInput) {
  const tracking =
    trackingSnapshot?.bookingId === booking.id ? trackingSnapshot : null;
  const navigationOrigin =
    liveLocation.location ?? fallbackOrigin ?? tracking?.providerLocation ?? null;
  const routeLabel = providerDirectionsLabel(
    directions,
    navigationRouteLoading,
    navigationRouteError,
  );
  const liveLocationLabel = providerLiveLocationStatusLabel(liveLocation);
  const isHalfSheet = sheetLevel !== 'peek';
  const isExpandedSheet = sheetLevel === 'expanded';

  return {
    data: {
      addressLabel: booking.serviceAddress ?? 'Address unavailable',
      destinationMarkerLabel: tracking?.destinationLocation
        ? 'Confirmed service pin'
        : 'Service address',
      distanceLabel: directions ? formatRouteDistance(directions.distanceMeters) : '--',
      guidance: providerNavigationGuidance(
        directions,
        navigationOrigin,
        navigationRouteLoading,
        navigationRouteError,
      ),
      isExpandedSheet,
      isHalfSheet,
      liveLocationLabel,
      navigationOrigin,
      refreshRouteDisabled: navigationRouteLoading,
      refreshRouteLabel: navigationRouteLoading ? 'Loading...' : 'Refresh route',
      routeDurationLabel: directions
        ? formatRouteDuration(directions.durationSeconds)
        : '--',
      routeInstructionRows: isExpandedSheet
        ? (directions?.steps ?? []).map((step, index) => ({
            id: `${index}-${step.instruction}`,
            instruction: step.instruction,
            number: String(index + 1),
          }))
        : [],
      routeLabel,
      tracking,
    },
    isLoading: false,
    error: null,
  };
}

function providerDirectionsLabel(
  directions: GeoDirectionsRoute | null,
  loading: boolean,
  error: string | null,
): string {
  if (loading) {
    return 'Loading route';
  }
  if (directions) {
    return `${formatRouteDistance(directions.distanceMeters)} - ${formatRouteDuration(
      directions.durationSeconds,
    )}`;
  }
  return error ?? 'Route unavailable';
}

function providerNavigationGuidance(
  directions: GeoDirectionsRoute | null,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
  loading: boolean,
  error: string | null,
): ProviderNavigationGuidance {
  if (loading) {
    return {
      instruction: 'Finding the best route',
      nextInstruction: null,
      distanceLabel: '...',
      maneuverSymbol: '↑',
    };
  }

  if (!directions?.steps.length) {
    return {
      instruction: error ?? 'Directions unavailable',
      nextInstruction: null,
      distanceLabel: '--',
      maneuverSymbol: '◎',
    };
  }

  const { step, index } = activeDirectionsStep(directions, origin);
  const nextStep = directions.steps[index + 1] ?? null;
  const distanceMeters = distanceToStepManeuver(directions, step, origin);

  return {
    instruction: cleanNavigationInstruction(step.instruction),
    nextInstruction: nextStep ? cleanNavigationInstruction(nextStep.instruction) : null,
    distanceLabel: formatRouteDistance(distanceMeters),
    maneuverSymbol: navigationManeuverSymbol(step),
  };
}

function activeDirectionsStep(
  directions: GeoDirectionsRoute,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
): { step: GeoDirectionsStep; index: number } {
  if (!origin || !directions.geometry.length) {
    return { step: directions.steps[0], index: 0 };
  }

  const nearestIndex = nearestGeometryIndex(directions.geometry, origin);
  const stepIndex = directions.steps.findIndex((step) => {
    const endIndex = step.wayPoints?.[1];
    return typeof endIndex === 'number' && endIndex >= nearestIndex;
  });

  const index = stepIndex >= 0 ? stepIndex : directions.steps.length - 1;
  return { step: directions.steps[index], index };
}

function distanceToStepManeuver(
  directions: GeoDirectionsRoute,
  step: GeoDirectionsStep,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
): number {
  const endIndex = step.wayPoints?.[1];
  const endPoint =
    typeof endIndex === 'number' ? directions.geometry[endIndex] : null;

  if (!origin || !endPoint) {
    return step.distanceMeters;
  }

  return Math.max(0, Math.round(distanceBetweenMeters(origin, endPoint)));
}

function nearestGeometryIndex(
  geometry: GeoRouteLocation[],
  origin: BookingTrackingLocation | GeoRouteLocation,
): number {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  geometry.forEach((point, index) => {
    const distance =
      (point.latitude - origin.latitude) ** 2 +
      (point.longitude - origin.longitude) ** 2;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function distanceBetweenMeters(
  start: GeoRouteLocation,
  end: GeoRouteLocation,
): number {
  const earthRadiusMeters = 6371000;
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function cleanNavigationInstruction(instruction: string): string {
  return instruction.replace(/\s+/g, ' ').trim() || 'Continue on route';
}

function navigationManeuverSymbol(step: GeoDirectionsStep): string {
  const instruction = step.instruction.toLowerCase();
  if (instruction.includes('left')) {
    return '↰';
  }
  if (instruction.includes('right')) {
    return '↱';
  }
  if (instruction.includes('roundabout')) {
    return '⟳';
  }
  if (instruction.includes('u-turn') || instruction.includes('uturn')) {
    return '⤴';
  }
  if (instruction.includes('arrive') || instruction.includes('destination')) {
    return '◎';
  }
  return '↑';
}

function providerLiveLocationStatusLabel({
  error,
  isPublishing,
  location,
}: ProviderLiveLocationState): string {
  if (error) {
    return 'Needs permission';
  }
  if (isPublishing) {
    return 'Updating';
  }
  if (!location) {
    return 'Starting';
  }
  if (
    typeof location.accuracyMeters === 'number' &&
    location.accuracyMeters > 50
  ) {
    return 'Improving GPS';
  }
  return 'Sharing';
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
