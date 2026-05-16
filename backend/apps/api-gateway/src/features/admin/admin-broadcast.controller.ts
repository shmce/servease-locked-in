import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { AdminRequiredError } from './admin-support.errors';

@Controller('v1/admin/broadcasts')
export class AdminBroadcastController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Post()
  @HttpCode(501)
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() _body: Record<string, unknown>,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return {
      error: {
        code: 'not_implemented',
        message: 'Broadcast messaging is not yet implemented.',
      },
    };
  }

  private async requireAdmin(authorization: string | undefined): Promise<void> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }
    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
