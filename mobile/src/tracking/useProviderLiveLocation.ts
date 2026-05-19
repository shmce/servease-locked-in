import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import {
  ApiOptions,
  BookingTrackingLocation,
  updateBookingLiveLocation,
} from '../../services/serveaseApi';

const MIN_SEND_INTERVAL_MS = 3000;
const MIN_SEND_DISTANCE_METERS = 10;

interface ProviderLiveLocationOptions {
  enabled: boolean;
  bookingId: string | null;
  apiOptions: ApiOptions;
}

interface ProviderLiveLocationState {
  location: BookingTrackingLocation | null;
  error: string | null;
  isPublishing: boolean;
}

export function useProviderLiveLocation({
  enabled,
  bookingId,
  apiOptions,
}: ProviderLiveLocationOptions): ProviderLiveLocationState {
  const [location, setLocation] = useState<BookingTrackingLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSentRef = useRef<{
    latitude: number;
    longitude: number;
    sentAt: number;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !bookingId) {
      lastSentRef.current = null;
      setIsPublishing(false);
      return undefined;
    }

    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;
    const activeBookingId = bookingId;

    async function startWatching() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) {
        return;
      }
      if (permission.status !== 'granted') {
        setError('Location permission is required to share live navigation.');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (position) => {
          const nextLocation: BookingTrackingLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy ?? null,
            headingDegrees:
              position.coords.heading === null || position.coords.heading < 0
                ? null
                : position.coords.heading,
            speedMps:
              position.coords.speed === null || position.coords.speed < 0
                ? null
                : position.coords.speed,
            updatedAt: new Date(position.timestamp).toISOString(),
          };

          setLocation(nextLocation);
          if (!shouldPublish(nextLocation, lastSentRef.current)) {
            return;
          }

          lastSentRef.current = {
            latitude: nextLocation.latitude,
            longitude: nextLocation.longitude,
            sentAt: Date.now(),
          };
          setIsPublishing(true);
          updateBookingLiveLocation(activeBookingId, nextLocation, apiOptions)
            .then((savedLocation) => {
              if (!isMounted) {
                return;
              }
              setLocation(savedLocation);
              setError(null);
            })
            .catch((publishError) => {
              if (!isMounted) {
                return;
              }
              setError(
                publishError instanceof Error
                  ? publishError.message
                  : 'Unable to publish live location.',
              );
            })
            .finally(() => {
              if (isMounted) {
                setIsPublishing(false);
              }
            });
        },
      );
    }

    void startWatching().catch((watchError) => {
      if (!isMounted) {
        return;
      }
      setError(
        watchError instanceof Error
          ? watchError.message
          : 'Unable to start live location.',
      );
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [enabled, bookingId, apiOptions]);

  return {
    location,
    error,
    isPublishing,
  };
}

function shouldPublish(
  nextLocation: BookingTrackingLocation,
  lastSent: { latitude: number; longitude: number; sentAt: number } | null,
): boolean {
  if (!lastSent) {
    return true;
  }

  const elapsedMs = Date.now() - lastSent.sentAt;
  const distanceMeters = distanceBetweenMeters(
    lastSent.latitude,
    lastSent.longitude,
    nextLocation.latitude,
    nextLocation.longitude,
  );

  return (
    elapsedMs >= MIN_SEND_INTERVAL_MS ||
    distanceMeters >= MIN_SEND_DISTANCE_METERS
  );
}

function distanceBetweenMeters(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
): number {
  const earthRadiusMeters = 6371000;
  const startLatRadians = toRadians(startLatitude);
  const endLatRadians = toRadians(endLatitude);
  const latDelta = toRadians(endLatitude - startLatitude);
  const lngDelta = toRadians(endLongitude - startLongitude);
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(startLatRadians) *
      Math.cos(endLatRadians) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
