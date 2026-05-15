import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import { ProviderProfileSummary } from './provider-profile.types';

@Controller('internal/providers')
export class ProviderProfileController {
  constructor(private readonly providerProfileService: ProviderProfileService) {}

  @Get('by-user/:userId')
  async show(@Param('userId') userId: string): Promise<{
    data: ProviderProfileSummary;
  }> {
    const data = await this.providerProfileService.findByUserId(userId);

    if (!data) {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_not_found',
            message: 'Provider profile was not found.',
            details: {},
          },
        },
        404,
      );
    }

    return { data };
  }
}
