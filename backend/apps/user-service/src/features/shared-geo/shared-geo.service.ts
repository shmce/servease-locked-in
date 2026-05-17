import { Injectable } from '@nestjs/common';
import { createApicenterClient } from '@servease/common';
import {
  InvalidSharedGeoRequestError,
  SharedGeoDependencyUnavailableError,
} from './shared-geo.errors';
import {
  GeoAddressResult,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './shared-geo.types';

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

  private isCoordinate(value: number, maxAbsolute: number): boolean {
    return Number.isFinite(value) && Math.abs(value) <= maxAbsolute;
  }
}

