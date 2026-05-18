import { Body, Controller, HttpException, Post } from '@nestjs/common';
import {
  InvalidSharedGeoRequestError,
  SharedGeoDependencyUnavailableError,
} from './shared-geo.errors';
import { SharedGeoService } from './shared-geo.service';
import {
  GeoAddressResult,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './shared-geo.types';

@Controller('internal/shared-geo')
export class SharedGeoController {
  constructor(private readonly sharedGeoService: SharedGeoService) {}

  @Post('geocode')
  async geocode(
    @Body() body: GeoGeocodeAddressRequest,
  ): Promise<{ data: GeoAddressResult }> {
    try {
      return { data: await this.sharedGeoService.geocodeAddress(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('reverse-geocode')
  async reverseGeocode(
    @Body() body: GeoReverseGeocodeRequest,
  ): Promise<{ data: GeoAddressResult }> {
    try {
      return { data: await this.sharedGeoService.reverseGeocode(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('geofence/check')
  async checkFence(
    @Body() body: GeoFenceCheckRequest,
  ): Promise<{ data: GeoFenceCheckResponse }> {
    try {
      return { data: await this.sharedGeoService.checkFence(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('directions')
  async directions(
    @Body() body: GeoDirectionsRequest,
  ): Promise<{ data: GeoDirectionsRoute }> {
    try {
      return { data: await this.sharedGeoService.directions(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidSharedGeoRequestError) {
      return this.error(
        'invalid_shared_geo_request',
        'Shared geo request is invalid.',
        400,
      );
    }

    if (error instanceof SharedGeoDependencyUnavailableError) {
      return this.error(
        'shared_geo_dependency_unavailable',
        'Shared geo service is unavailable.',
        503,
      );
    }

    return this.error(
      'shared_geo_dependency_unavailable',
      'Shared geo request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
