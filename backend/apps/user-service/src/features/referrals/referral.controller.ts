import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralSummary } from './referral.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/users')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':userId/referral-summary')
  async show(@Param('userId') userId: string): Promise<{ data: ReferralSummary }> {
    if (!UUID_PATTERN.test(userId)) {
      throw this.error('invalid_referral_request', 'Referral request is invalid.', 400);
    }

    try {
      return {
        data: await this.referralService.getSummary(userId),
      };
    } catch {
      throw this.error(
        'referral_dependency_unavailable',
        'Referral lookup failed.',
        503,
      );
    }
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
