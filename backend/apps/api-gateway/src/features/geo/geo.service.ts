import { Injectable } from '@nestjs/common';
import { GeoServiceClient } from './clients/geo-service.client';
import { InvalidGeoRequestError } from './geo.errors';
import {
  GeoAddressResult,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './geo.types';

@Injectable()
export class GeoGatewayService {
  constructor(private readonly geoServiceClient: GeoServiceClient) {}

  geocodeAddress(input: GeoGeocodeAddressRequest): Promise<GeoAddressResult> {
    if (!input.address?.trim()) {
      throw new InvalidGeoRequestError();
    }

    return this.geoServiceClient.geocodeAddress({
      address: input.address.trim(),
      language: input.language?.trim() || undefined,
      region: input.region?.trim() || undefined,
    });
  }

  reverseGeocode(input: GeoReverseGeocodeRequest): Promise<GeoAddressResult> {
    if (
      !this.isCoordinate(input.latitude, 90) ||
      !this.isCoordinate(input.longitude, 180)
    ) {
      throw new InvalidGeoRequestError();
    }

    return this.geoServiceClient.reverseGeocode({
      latitude: input.latitude,
      longitude: input.longitude,
      language: input.language?.trim() || undefined,
      resultType: input.resultType?.trim() || undefined,
      locationType: input.locationType?.trim() || undefined,
    });
  }

  checkFence(input: GeoFenceCheckRequest): Promise<GeoFenceCheckResponse> {
    if (
      !this.isCoordinate(input.latitude, 90) ||
      !this.isCoordinate(input.longitude, 180) ||
      (!input.fenceId?.trim() && !input.fences?.length)
    ) {
      throw new InvalidGeoRequestError();
    }

    return this.geoServiceClient.checkFence({
      latitude: input.latitude,
      longitude: input.longitude,
      fenceId: input.fenceId?.trim() || undefined,
      fences: input.fences,
    });
  }

  directions(input: GeoDirectionsRequest): Promise<GeoDirectionsRoute> {
    if (
      !this.isCoordinate(input.origin?.latitude, 90) ||
      !this.isCoordinate(input.origin?.longitude, 180) ||
      !this.isCoordinate(input.destination?.latitude, 90) ||
      !this.isCoordinate(input.destination?.longitude, 180)
    ) {
      throw new InvalidGeoRequestError();
    }

    return this.geoServiceClient.directions({
      origin: input.origin,
      destination: input.destination,
      profile: input.profile?.trim() as GeoDirectionsRequest['profile'],
      language: input.language?.trim() || undefined,
    });
  }

  private isCoordinate(value: number | undefined, maxAbsolute: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Math.abs(value) <= maxAbsolute
    );
  }
}
