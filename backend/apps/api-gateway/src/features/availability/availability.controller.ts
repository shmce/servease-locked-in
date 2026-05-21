import { Body, Controller, Delete, Get, Headers, HttpException, Param, Post, Put } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AvailabilityDependencyUnavailableError,
  InvalidAvailabilityRequestError,
  ProviderProfileRequiredError,
  TimeOffConflictsBookingError,
  TimeOffTooSoonError,
} from './availability.errors';
import { AvailabilityGatewayService } from './availability.service';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  ProviderAvailabilitySchedule,
} from './availability.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('v1/provider/availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityGatewayService: AvailabilityGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  @Get()
  async show(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.getSchedule(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('windows')
  async replaceWindows(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { windows: AvailabilityWindowInput[] },
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.replaceWindows(
          providerId,
          body.windows,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('days-off')
  async addDayOff(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { offDate: string; reason?: string | null },
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.addDayOff(
          providerId,
          body.offDate,
          body.reason,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('days-off/:offDate')
  async removeDayOff(
    @Headers('authorization') authorization: string | undefined,
    @Param('offDate') offDate: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.removeDayOff(
          providerId,
          offDate,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('time-off')
  async addTimeOff(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: AddProviderTimeOffWindowInput,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.addTimeOffWindow(
          providerId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('time-off/:id')
  async removeTimeOff(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      const providerId = await this.resolveProviderId(authorization);
      return {
        data: await this.availabilityGatewayService.removeTimeOffWindow(
          providerId,
          id,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':providerId')
  async publicShow(
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      this.validateProviderId(providerId);
      return {
        data: await this.availabilityGatewayService.getSchedule(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async resolveProviderId(
    authorization: string | undefined,
  ): Promise<string> {
    const userId = await this.authTokenService.authenticate(authorization);
    const providerProfile =
      await this.catalogServiceClient.findProviderProfileByUserId(userId);

    if (!providerProfile) {
      throw new ProviderProfileRequiredError();
    }

    return providerProfile.id;
  }

  private validateProviderId(providerId: string): void {
    if (!UUID_PATTERN.test(providerId)) {
      throw new InvalidAvailabilityRequestError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof ProviderProfileRequiredError) {
      return this.error(
        'provider_profile_required',
        'A provider profile is required.',
        403,
      );
    }

    if (error instanceof InvalidAvailabilityRequestError) {
      return this.error(
        'invalid_availability_request',
        'Availability request is invalid.',
        400,
      );
    }

    if (error instanceof TimeOffTooSoonError) {
      return this.error(
        'time_off_too_soon',
        'Provider time off must be at least 2 days from today.',
        422,
      );
    }

    if (error instanceof TimeOffConflictsBookingError) {
      return this.error(
        'time_off_conflicts_booking',
        'Provider time off conflicts with an active booking.',
        409,
      );
    }

    if (error instanceof AvailabilityDependencyUnavailableError) {
      return this.error(
        'availability_dependency_unavailable',
        'Availability service is unavailable.',
        503,
      );
    }

    return this.error(
      'availability_dependency_unavailable',
      'Availability request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
