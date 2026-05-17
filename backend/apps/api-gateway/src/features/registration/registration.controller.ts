import { Body, Controller, Get, Headers, HttpException, Post } from '@nestjs/common';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  InvalidPasswordResetRequestError,
  InvalidRegistrationRequestError,
  PasswordResetDependencyUnavailableError,
  ProviderApplicationDependencyUnavailableError,
  ProviderApplicationNotFoundError,
  RegistrationConflictError,
  RegistrationDependencyUnavailableError,
} from './registration.errors';
import { RegistrationGatewayService } from './registration.service';
import {
  PasswordResetRequest,
  PasswordResetResponse,
  ProviderApplicationStatusResponse,
  RegisterAccountRequest,
  RegisteredAccountResponse,
} from './registration.types';

@Controller('v1/auth')
export class RegistrationController {
  constructor(
    private readonly registrationGatewayService: RegistrationGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterAccountRequest,
  ): Promise<{ data: RegisteredAccountResponse }> {
    try {
      return {
        data: await this.registrationGatewayService.register(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('password-reset')
  async requestPasswordReset(
    @Body() body: PasswordResetRequest,
  ): Promise<{ data: PasswordResetResponse }> {
    try {
      return {
        data: await this.registrationGatewayService.requestPasswordReset(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('provider-application/me')
  async providerApplicationStatus(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: ProviderApplicationStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.registrationGatewayService.getProviderApplicationStatus(
          userId,
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

    if (error instanceof ProviderApplicationNotFoundError) {
      return this.error(
        'provider_application_not_found',
        'Provider application was not found.',
        404,
      );
    }

    if (error instanceof ProviderApplicationDependencyUnavailableError) {
      return this.error(
        'provider_application_dependency_unavailable',
        'Provider application status is unavailable.',
        503,
      );
    }

    if (error instanceof InvalidPasswordResetRequestError) {
      return this.error(
        'invalid_password_reset_request',
        'Password reset request is invalid.',
        400,
      );
    }

    if (error instanceof PasswordResetDependencyUnavailableError) {
      return this.error(
        'password_reset_dependency_unavailable',
        'Password reset service is unavailable.',
        503,
      );
    }

    if (error instanceof InvalidRegistrationRequestError) {
      return this.error(
        'invalid_registration_request',
        'Registration request is invalid.',
        400,
      );
    }

    if (error instanceof RegistrationConflictError) {
      return this.error(
        'registration_conflict',
        'An account with this email already exists.',
        409,
      );
    }

    if (error instanceof RegistrationDependencyUnavailableError) {
      return this.error(
        'registration_dependency_unavailable',
        'Registration service is unavailable.',
        503,
      );
    }

    return this.error('registration_dependency_unavailable', 'Registration failed.', 503);
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
