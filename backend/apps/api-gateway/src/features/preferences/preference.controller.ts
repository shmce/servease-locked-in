import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Put,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidUserPreferencesRequestError,
  UserPreferencesDependencyUnavailableError,
} from './preference.errors';
import { UserPreferenceGatewayService } from './preference.service';
import {
  UpdateUserPreferencesRequest,
  UserPreferenceSummary,
} from './preference.types';

@Controller('v1/me/preferences')
export class UserPreferenceController {
  constructor(
    private readonly preferenceGatewayService: UserPreferenceGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async show(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: UserPreferenceSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.preferenceGatewayService.getPreferences(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put()
  async update(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateUserPreferencesRequest,
  ): Promise<{ data: UserPreferenceSummary }> {
    try {
      this.validateUpdateRequest(body);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.preferenceGatewayService.updatePreferences(userId, body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validateUpdateRequest(body: UpdateUserPreferencesRequest): void {
    if (body.language !== undefined && !['en', 'fil', null].includes(body.language)) {
      throw new InvalidUserPreferencesRequestError();
    }

    if (
      body.notificationPreferences !== undefined &&
      body.notificationPreferences !== null &&
      (typeof body.notificationPreferences !== 'object' ||
        Array.isArray(body.notificationPreferences))
    ) {
      throw new InvalidUserPreferencesRequestError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidUserPreferencesRequestError) {
      return this.error(
        'invalid_user_preferences_request',
        'User preferences request is invalid.',
        400,
      );
    }

    if (error instanceof UserPreferencesDependencyUnavailableError) {
      return this.error(
        'user_preferences_dependency_unavailable',
        'User preferences service is unavailable.',
        503,
      );
    }

    return this.error(
      'user_preferences_dependency_unavailable',
      'User preferences update failed.',
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
