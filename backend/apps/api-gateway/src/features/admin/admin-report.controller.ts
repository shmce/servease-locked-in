import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Param,
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
    message: 'Report generation is not yet implemented.',
  },
};

@Controller('v1/admin/reports')
export class AdminReportController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get('revenue.pdf')
  @HttpCode(501)
  async revenuePdf(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Get('bookings.csv')
  @HttpCode(501)
  async bookingsCsv(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Post(':type')
  @HttpCode(501)
  async generate(
    @Headers('authorization') authorization: string | undefined,
    @Param('type') _type: string,
    @Body() _body: Record<string, unknown>,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Post(':type/schedules')
  @HttpCode(501)
  async schedule(
    @Headers('authorization') authorization: string | undefined,
    @Param('type') _type: string,
    @Body() _body: Record<string, unknown>,
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
