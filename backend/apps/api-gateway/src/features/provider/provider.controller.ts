import { Body, Controller, Get, Headers, HttpException, Put } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AccountInactiveError,
  AuthRequiredError,
  InvalidAuthTokenError,
  ProfileDependencyUnavailableError,
} from '../current-user/current-user.errors';
import { CatalogDependencyUnavailableError } from '../catalog/catalog.errors';
import {
  InvalidProviderRequestError,
  ProviderProfileRequiredError,
} from './provider.errors';
import { ProviderGatewayService } from './provider.service';
import {
  ProviderDashboardSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  ProviderProfileSnapshot,
} from './provider.types';

@Controller('v1/provider')
export class ProviderController {
  constructor(
    private readonly providerGatewayService: ProviderGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get('profile')
  async profile(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ProviderProfileSnapshot }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.providerGatewayService.getProviderProfile(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('dashboard')
  async dashboard(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ProviderDashboardSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.providerGatewayService.getProviderDashboard(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('services')
  async services(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ProviderOwnedServiceSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.providerGatewayService.listProviderServices(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('services')
  async replaceServices(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { services?: ProviderOwnedServiceInput[] },
  ): Promise<{ data: ProviderOwnedServiceSummary[] }> {
    try {
      if (
        !Array.isArray(body.services) ||
        body.services.some((service) => !service.title?.trim())
      ) {
        throw new InvalidProviderRequestError();
      }
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.providerGatewayService.replaceProviderServices(
          userId,
          body.services,
        ),
      };
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

    if (error instanceof AccountInactiveError) {
      return this.error('account_inactive', 'Account is inactive.', 403);
    }

    if (error instanceof ProviderProfileRequiredError) {
      return this.error(
        'provider_profile_required',
        'A provider profile is required.',
        403,
      );
    }

    if (error instanceof InvalidProviderRequestError) {
      return this.error(
        'invalid_provider_request',
        'Provider request is invalid.',
        400,
      );
    }

    if (
      error instanceof ProfileDependencyUnavailableError ||
      error instanceof CatalogDependencyUnavailableError
    ) {
      return this.error(
        'provider_dependency_unavailable',
        'Provider profile is unavailable.',
        503,
      );
    }

    return this.error(
      'provider_dependency_unavailable',
      'Provider profile lookup failed.',
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
