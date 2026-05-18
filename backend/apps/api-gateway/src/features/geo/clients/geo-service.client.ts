import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GeoDependencyUnavailableError,
  InvalidGeoRequestError,
} from '../geo.errors';
import {
  GeoAddressResult,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from '../geo.types';

@Injectable()
export class GeoServiceClient {
  constructor(private readonly configService: ConfigService) {}

  geocodeAddress(input: GeoGeocodeAddressRequest): Promise<GeoAddressResult> {
    return this.request<GeoAddressResult>(
      '/internal/shared-geo/geocode',
      'POST',
      input,
    );
  }

  reverseGeocode(input: GeoReverseGeocodeRequest): Promise<GeoAddressResult> {
    return this.request<GeoAddressResult>(
      '/internal/shared-geo/reverse-geocode',
      'POST',
      input,
    );
  }

  checkFence(input: GeoFenceCheckRequest): Promise<GeoFenceCheckResponse> {
    return this.request<GeoFenceCheckResponse>(
      '/internal/shared-geo/geofence/check',
      'POST',
      input,
    );
  }

  directions(input: GeoDirectionsRequest): Promise<GeoDirectionsRoute> {
    return this.request<GeoDirectionsRoute>(
      '/internal/shared-geo/directions',
      'POST',
      input,
    );
  }

  private async request<T>(
    path: string,
    method: 'POST',
    body: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl()}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_shared_geo_request') {
        throw new InvalidGeoRequestError();
      }
      throw new GeoDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private baseUrl(): string {
    return this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:8502',
    );
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
