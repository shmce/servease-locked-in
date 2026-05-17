import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InternalUserService } from './internal-user.service';
import {
  InternalUserResponse,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
  UserSessionRecord,
} from './user.types';
import { UserNotFoundError } from './internal-user.errors';

@Controller('internal/users')
export class InternalUserController {
  constructor(private readonly internalUserService: InternalUserService) {}

  @Get(':userId')
  async show(@Param('userId') userId: string): Promise<{
    data: InternalUserResponse;
  }> {
    try {
      const data = await this.internalUserService.findById(userId);
      return { data };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            error: {
              code: 'user_not_found',
              message: 'User was not found.',
              details: {},
            },
          },
          404,
        );
      }

      throw new HttpException(
        {
          error: {
            code: 'profile_dependency_unavailable',
            message: 'User lookup failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Get(':userId/sessions')
  async listSessions(
    @Param('userId') userId: string,
  ): Promise<{ data: UserSessionRecord[] }> {
    try {
      return { data: await this.internalUserService.listSessions(userId) };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            error: {
              code: 'user_not_found',
              message: 'User was not found.',
              details: {},
            },
          },
          404,
        );
      }
      console.error('[auth-service sessions] unexpected error:', error);
      throw new HttpException(
        {
          error: {
            code: 'profile_dependency_unavailable',
            message: 'Session lookup failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() body: { fullName: string; contactNumber?: string | null },
  ): Promise<{ data: InternalUserResponse }> {
    try {
      if (!body.fullName?.trim()) {
        throw new HttpException(
          {
            error: {
              code: 'invalid_user_profile_request',
              message: 'User profile request is invalid.',
              details: {},
            },
          },
          400,
        );
      }

      const data = await this.internalUserService.update({
        userId,
        fullName: body.fullName.trim(),
        contactNumber: body.contactNumber?.trim() || null,
      });
      return { data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            error: {
              code: 'user_not_found',
              message: 'User was not found.',
              details: {},
            },
          },
          404,
        );
      }

      throw new HttpException(
        {
          error: {
            code: 'profile_dependency_unavailable',
            message: 'User update failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Delete(':userId/account')
  async deleteAccount(@Param('userId') userId: string): Promise<{
    data: InternalUserResponse;
  }> {
    try {
      return { data: await this.internalUserService.anonymizeAccount(userId) };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            error: {
              code: 'user_not_found',
              message: 'User was not found.',
              details: {},
            },
          },
          404,
        );
      }

      throw new HttpException(
        {
          error: {
            code: 'profile_dependency_unavailable',
            message: 'Account deletion failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Post(':userId/two-factor/enable')
  async enableTwoFactor(
    @Param('userId') userId: string,
    @Body() body: { label?: string | null },
  ): Promise<{ data: TwoFactorProvisioningResponse }> {
    try {
      return {
        data: await this.internalUserService.beginTwoFactor(
          userId,
          body.label ?? null,
        ),
      };
    } catch (error) {
      throw this.toTwoFactorHttpException(error);
    }
  }

  @Post(':userId/two-factor/verify')
  async verifyTwoFactor(
    @Param('userId') userId: string,
    @Body() body: { code?: string | null },
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      return {
        data: await this.internalUserService.verifyTwoFactor(
          userId,
          body.code ?? '',
        ),
      };
    } catch (error) {
      throw this.toTwoFactorHttpException(error);
    }
  }

  @Post(':userId/two-factor/disable')
  async disableTwoFactor(
    @Param('userId') userId: string,
    @Body() body: { code?: string | null },
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      return {
        data: await this.internalUserService.disableTwoFactor(
          userId,
          body.code ?? null,
        ),
      };
    } catch (error) {
      throw this.toTwoFactorHttpException(error);
    }
  }

  private toTwoFactorHttpException(error: unknown): HttpException {
    if (error instanceof UserNotFoundError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_two_factor_request',
            message: 'Two-factor authentication request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    return new HttpException(
      {
        error: {
          code: 'profile_dependency_unavailable',
          message: 'Two-factor authentication update failed.',
          details: {},
        },
      },
      503,
    );
  }
}
