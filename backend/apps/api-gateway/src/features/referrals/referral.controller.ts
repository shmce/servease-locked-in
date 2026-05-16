import { Controller, Get, Headers, HttpException } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { ReferralDependencyUnavailableError } from './referral.errors';
import { ReferralGatewayService } from './referral.service';
import { ReferralSummary } from './referral.types';

@Controller('v1/referrals')
export class ReferralController {
  constructor(
    private readonly referralGatewayService: ReferralGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async show(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ReferralSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.referralGatewayService.getSummary(userId),
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

    if (error instanceof ReferralDependencyUnavailableError) {
      return this.error(
        'referral_dependency_unavailable',
        'Referral service is unavailable.',
        503,
      );
    }

    return this.error('referral_dependency_unavailable', 'Referral lookup failed.', 503);
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
