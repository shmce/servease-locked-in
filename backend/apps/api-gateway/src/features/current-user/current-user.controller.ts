import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import {
  AccountInactiveError,
  AuthRequiredError,
  InvalidAuthTokenError,
  InvalidTwoFactorRequestError,
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from './current-user.errors';
import {
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
} from '../registration/registration.errors';
import { AuthTokenService } from './auth-token.service';
import { CurrentUserService } from './current-user.service';
import {
  CurrentUserProfile,
  CurrentUserSessionSummary,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
  TwoFactorVerificationInput,
  UpdateCurrentUserPasswordInput,
  UpdateCurrentUserPasswordResponse,
  UpdateCurrentUserProfileInput,
} from './current-user.types';

@Controller('v1/me')
export class CurrentUserController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async show(@Headers('authorization') authorization?: string): Promise<{
    data: CurrentUserProfile;
  }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.getCurrentUser(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch()
  async update(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateCurrentUserProfileInput,
  ): Promise<{ data: CurrentUserProfile }> {
    try {
      if (!body.fullName?.trim()) {
        throw this.error(
          'invalid_profile_update_request',
          'Profile update request is invalid.',
          400,
        );
      }
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.updateCurrentUser(userId, {
        fullName: body.fullName.trim(),
        contactNumber: body.contactNumber?.trim() || null,
        address: body.address?.trim() || null,
        businessName: body.businessName?.trim() || null,
        bio: body.bio?.trim() || null,
        serviceDescription: body.serviceDescription?.trim() || null,
        serviceArea: body.serviceArea?.trim() || null,
        yearsExperience:
          body.yearsExperience === undefined || body.yearsExperience === null
            ? null
            : Number(body.yearsExperience),
      });
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('password')
  async updatePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateCurrentUserPasswordInput,
  ): Promise<{ data: UpdateCurrentUserPasswordResponse }> {
    try {
      if (
        !body.currentPassword ||
        !body.newPassword ||
        body.newPassword.length < 8 ||
        body.currentPassword === body.newPassword
      ) {
        throw this.error(
          'invalid_password_change_request',
          'Password change request is invalid.',
          400,
        );
      }
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.updateCurrentUserPassword(
        userId,
        body,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete()
  async deleteAccount(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: { ok: true } }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.deleteCurrentUser(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('sessions')
  async listSessions(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: CurrentUserSessionSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.listCurrentUserSessions(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/enable')
  async enableTwoFactor(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: TwoFactorProvisioningResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.enableTwoFactor(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/verify')
  async verifyTwoFactor(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: TwoFactorVerificationInput,
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.verifyTwoFactor(
        userId,
        body.code ?? '',
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/disable')
  async disableTwoFactor(
    @Headers('authorization') authorization?: string,
    @Body() body?: TwoFactorVerificationInput,
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.disableTwoFactor(
        userId,
        body?.code ?? null,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof AccountInactiveError) {
      return this.error('account_inactive', 'This account is not active.', 403);
    }

    if (error instanceof InvalidPasswordChangeRequestError) {
      return this.error(
        'invalid_password_change_request',
        'Password change request is invalid.',
        400,
      );
    }

    if (error instanceof PasswordChangeDependencyUnavailableError) {
      return this.error(
        'password_change_dependency_unavailable',
        'Password change service is unavailable.',
        503,
      );
    }

    if (error instanceof UserNotFoundError) {
      return this.error('user_not_found', 'User was not found.', 404);
    }

    if (error instanceof InvalidTwoFactorRequestError) {
      return this.error(
        'invalid_two_factor_request',
        'Two-factor authentication request is invalid.',
        400,
      );
    }

    if (error instanceof ProfileDependencyUnavailableError) {
      return this.error(
        'profile_dependency_unavailable',
        'Profile service is unavailable.',
        503,
      );
    }

    return this.error(
      'profile_dependency_unavailable',
      'Profile lookup failed.',
      503,
    );
  }

  private error(code: string, message: string, status: HttpStatus): HttpException {
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
