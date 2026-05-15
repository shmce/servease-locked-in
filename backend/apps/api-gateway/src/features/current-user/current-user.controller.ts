import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Patch,
  Body,
} from '@nestjs/common';
import {
  AccountInactiveError,
  AuthRequiredError,
  InvalidAuthTokenError,
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from './current-user.errors';
import { AuthTokenService } from './auth-token.service';
import { CurrentUserService } from './current-user.service';
import {
  CurrentUserProfile,
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
      });
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

    if (error instanceof UserNotFoundError) {
      return this.error('user_not_found', 'User was not found.', 404);
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
