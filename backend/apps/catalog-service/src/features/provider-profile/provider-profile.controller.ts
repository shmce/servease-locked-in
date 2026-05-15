import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import {
  CreateProviderProfileInput,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderProfileSummary,
} from './provider-profile.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  @Post()
  async create(
    @Body() body: CreateProviderProfileInput,
  ): Promise<{ data: ProviderProfileSummary }> {
    if (!UUID_PATTERN.test(body.userId) || !body.businessName?.trim()) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_provider_profile_request',
            message: 'Provider profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.providerProfileService.create({
          userId: body.userId,
          businessName: body.businessName.trim(),
          serviceDescription: body.serviceDescription ?? null,
          serviceArea: body.serviceArea ?? null,
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_dependency_unavailable',
            message: 'Provider profile creation failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Patch('by-user/:userId')
  async update(
    @Param('userId') userId: string,
    @Body() body: { businessName: string },
  ): Promise<{ data: ProviderProfileSummary }> {
    if (!UUID_PATTERN.test(userId) || !body.businessName?.trim()) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_provider_profile_request',
            message: 'Provider profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.providerProfileService.update({
          userId,
          businessName: body.businessName.trim(),
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_dependency_unavailable',
            message: 'Provider profile update failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Get(':providerId/portfolio')
  async listPortfolio(
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    if (!UUID_PATTERN.test(providerId)) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.listPortfolioMedia(providerId),
      };
    } catch {
      throw this.dependencyError('Provider portfolio lookup failed.');
    }
  }

  @Post('portfolio')
  async addPortfolio(
    @Body() body: ProviderPortfolioMediaInput,
  ): Promise<{ data: ProviderPortfolioMediaSummary }> {
    if (!UUID_PATTERN.test(body.userId) || !body.fileUrl?.trim()) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.addPortfolioMedia(body),
      };
    } catch {
      throw this.dependencyError('Provider portfolio upload failed.');
    }
  }

  @Delete('portfolio/:mediaId')
  @HttpCode(204)
  async deletePortfolio(
    @Param('mediaId') mediaId: string,
    @Body() body: { userId: string },
  ): Promise<void> {
    if (!UUID_PATTERN.test(body.userId) || !UUID_PATTERN.test(mediaId)) {
      throw this.invalidRequest();
    }

    try {
      await this.providerProfileService.deletePortfolioMedia(body.userId, mediaId);
    } catch {
      throw this.dependencyError('Provider portfolio delete failed.');
    }
  }

  private invalidRequest(): HttpException {
    return new HttpException(
      {
        error: {
          code: 'invalid_provider_profile_request',
          message: 'Provider profile request is invalid.',
          details: {},
        },
      },
      400,
    );
  }

  private dependencyError(message: string): HttpException {
    return new HttpException(
      {
        error: {
          code: 'provider_profile_dependency_unavailable',
          message,
          details: {},
        },
      },
      503,
    );
  }
}
