import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { AdminRequiredError } from './admin-support.errors';

const notImplemented = {
  error: {
    code: 'not_implemented',
    message: 'Integration management is not yet implemented.',
  },
};

@Controller('v1/admin/integrations')
export class AdminIntegrationController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Patch(':provider/credentials')
  @HttpCode(501)
  async updateCredentials(
    @Headers('authorization') authorization: string | undefined,
    @Param('provider') _provider: string,
    @Body() _body: Record<string, unknown>,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Post(':provider/test')
  @HttpCode(501)
  async test(
    @Headers('authorization') authorization: string | undefined,
    @Param('provider') _provider: string,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  private async requireAdmin(authorization: string | undefined): Promise<void> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
