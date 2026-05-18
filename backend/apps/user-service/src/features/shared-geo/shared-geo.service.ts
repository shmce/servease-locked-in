import { Injectable } from '@nestjs/common';
import { createApicenterClient } from '../../../../../libs/common/src';
import {
  InvalidSharedGeoRequestError,
  SharedGeoDependencyUnavailableError,
} from './shared-geo.errors';
import {
  GeoAddressResult,
  GeoDirectionsProfile,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './shared-geo.types';

const OPENROUTESERVICE_BASE_URL = 'https://api.openrouteservice.org';
const OPENROUTESERVICE_PROFILES = new Set<GeoDirectionsProfile>([
  'driving-car',
  'driving-hgv',
  'cycling-regular',
  'foot-walking',
]);

interface OpenRouteServiceStep {
  instruction?: string;
  distance?: number;
  duration?: number;
  name?: string;
  type?: number;
  way_points?: [number, number];
}

interface OpenRouteServicePayload {
  bbox?: [number, number, number, number];
  features?: Array<{
    bbox?: [number, number, number, number];
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
      segments?: Array<{
        distance?: number;
        duration?: number;
        steps?: OpenRouteServiceStep[];
      }>;
    };
  }>;
}

@Injectable()
export class SharedGeoService {
  async geocodeAddress(
    input: GeoGeocodeAddressRequest,
  ): Promise<GeoAddressResult> {
    const address = input.address?.trim();
    if (!address) {
      throw new InvalidSharedGeoRequestError();
    }

    try {
      return await createApicenterClient().geoGeocodeAddress({
        address,
        language: input.language?.trim() || undefined,
        region: input.region?.trim() || undefined,
      });
    } catch (error) {
      if (error instanceof InvalidSharedGeoRequestError) {
        throw error;
      }
      throw new SharedGeoDependencyUnavailableError();
    }
  }

  async reverseGeocode(
    input: GeoReverseGeocodeRequest,
  ): Promise<GeoAddressResult> {
    if (!this.isCoordinate(input.latitude, 90) || !this.isCoordinate(input.longitude, 180)) {
      throw new InvalidSharedGeoRequestError();
    }

    try {
      return await createApicenterClient().geoReverseGeocode({
        latitude: input.latitude,
        longitude: input.longitude,
        language: input.language?.trim() || undefined,
        resultType: input.resultType?.trim() || undefined,
        locationType: input.locationType?.trim() || undefined,
      });
    } catch (error) {
      if (error instanceof InvalidSharedGeoRequestError) {
        throw error;
      }
      throw new SharedGeoDependencyUnavailableError();
    }
  }

  async checkFence(
    input: GeoFenceCheckRequest,
  ): Promise<GeoFenceCheckResponse> {
    if (
      !this.isCoordinate(input.latitude, 90) ||
      !this.isCoordinate(input.longitude, 180) ||
      (!input.fenceId?.trim() && !input.fences?.length) ||
      input.fences?.some(
        (fence) =>
          !fence.fenceId?.trim() ||
          !this.isCoordinate(fence.latitude, 90) ||
          !this.isCoordinate(fence.longitude, 180) ||
          !Number.isFinite(fence.radiusMeters) ||
          fence.radiusMeters <= 0,
      )
    ) {
      throw new InvalidSharedGeoRequestError();
    }

    try {
      return await createApicenterClient().geoFenceCheck({
        latitude: input.latitude,
        longitude: input.longitude,
        fenceId: input.fenceId?.trim() || undefined,
        fences: input.fences?.map((fence) => ({
          ...fence,
          fenceId: fence.fenceId.trim(),
          name: fence.name?.trim() || undefined,
        })),
      });
    } catch (error) {
      if (error instanceof InvalidSharedGeoRequestError) {
        throw error;
      }
      throw new SharedGeoDependencyUnavailableError();
    }
  }

  async directions(input: GeoDirectionsRequest): Promise<GeoDirectionsRoute> {
    if (
      !this.isCoordinate(input.origin?.latitude, 90) ||
      !this.isCoordinate(input.origin?.longitude, 180) ||
      !this.isCoordinate(input.destination?.latitude, 90) ||
      !this.isCoordinate(input.destination?.longitude, 180)
    ) {
      throw new InvalidSharedGeoRequestError();
    }

    const profile = this.normalizeDirectionsProfile(input.profile);
    const apiKey = process.env.OPENROUTESERVICE_API_KEY?.trim();
    if (!apiKey) {
      throw new SharedGeoDependencyUnavailableError();
    }

    try {
      const response = await fetch(
        `${OPENROUTESERVICE_BASE_URL}/v2/directions/${profile}/geojson`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json, application/geo+json',
            authorization: apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [input.origin.longitude, input.origin.latitude],
              [input.destination.longitude, input.destination.latitude],
            ],
            instructions: true,
            language: input.language?.trim() || 'en',
            units: 'm',
          }),
        },
      );

      if (!response.ok) {
        throw new SharedGeoDependencyUnavailableError();
      }

      return this.normalizeDirectionsPayload(await response.json());
    } catch (error) {
      if (
        error instanceof InvalidSharedGeoRequestError ||
        error instanceof SharedGeoDependencyUnavailableError
      ) {
        throw error;
      }
      throw new SharedGeoDependencyUnavailableError();
    }
  }

  private isCoordinate(value: number | undefined, maxAbsolute: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Math.abs(value) <= maxAbsolute
    );
  }

  private normalizeDirectionsProfile(
    profile: GeoDirectionsProfile | undefined,
  ): GeoDirectionsProfile {
    const trimmed = profile?.trim() as GeoDirectionsProfile | undefined;
    if (!trimmed) {
      return 'driving-car';
    }
    if (!OPENROUTESERVICE_PROFILES.has(trimmed)) {
      throw new InvalidSharedGeoRequestError();
    }
    return trimmed;
  }

  private normalizeDirectionsPayload(payload: unknown): GeoDirectionsRoute {
    const parsed = payload as OpenRouteServicePayload;
    const feature = parsed.features?.[0];
    const summary = feature?.properties?.summary;
    const coordinates = feature?.geometry?.coordinates ?? [];

    if (
      !feature ||
      !summary ||
      !Number.isFinite(summary.distance) ||
      !Number.isFinite(summary.duration) ||
      !coordinates.length
    ) {
      throw new SharedGeoDependencyUnavailableError();
    }

    return {
      provider: 'openrouteservice',
      distanceMeters: Number(summary.distance),
      durationSeconds: Number(summary.duration),
      geometry: coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      })),
      steps: (feature.properties?.segments ?? []).flatMap((segment) =>
        (segment.steps ?? []).map((step) => ({
          instruction: step.instruction?.trim() || 'Continue',
          distanceMeters: Number(step.distance ?? 0),
          durationSeconds: Number(step.duration ?? 0),
          name: step.name?.trim() || undefined,
          type: step.type,
          wayPoints: step.way_points,
        })),
      ),
      bbox: feature.bbox ?? parsed.bbox,
      raw: payload,
    };
  }
}
