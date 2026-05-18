import { Body, Controller, Headers, HttpException, Post } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  GeoDependencyUnavailableError,
  InvalidGeoRequestError,
} from './geo.errors';
import { GeoGatewayService } from './geo.service';
import {
  GeoAddressResult,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoFenceCheckRequest,
  GeoFenceCheckResponse,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './geo.types';

@Controller('v1/geo')
export class GeoController {
  constructor(
    private readonly geoGatewayService: GeoGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post('geocode')
  async geocode(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: GeoGeocodeAddressRequest,
  ): Promise<{ data: GeoAddressResult }> {
    try {
      await this.authTokenService.authenticate(authorization);
      return { data: await this.geoGatewayService.geocodeAddress(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('reverse-geocode')
  async reverseGeocode(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: GeoReverseGeocodeRequest,
  ): Promise<{ data: GeoAddressResult }> {
    try {
      await this.authTokenService.authenticate(authorization);
      return { data: await this.geoGatewayService.reverseGeocode(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('geofence/check')
  async checkFence(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: GeoFenceCheckRequest,
  ): Promise<{ data: GeoFenceCheckResponse }> {
    try {
      await this.authTokenService.authenticate(authorization);
      return { data: await this.geoGatewayService.checkFence(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('directions')
  async directions(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: GeoDirectionsRequest,
  ): Promise<{ data: GeoDirectionsRoute }> {
    try {
      await this.authTokenService.authenticate(authorization);
      return { data: await this.geoGatewayService.directions(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidGeoRequestError) {
      return this.error('invalid_geo_request', 'Geo request is invalid.', 400);
    }

    if (error instanceof GeoDependencyUnavailableError) {
      return this.error(
        'geo_dependency_unavailable',
        'Geo service is unavailable.',
        503,
      );
    }

    return this.error('geo_dependency_unavailable', 'Geo request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
