import { Body, Controller, Headers, HttpException, Post } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { PricingServiceClient } from './clients/pricing-service.client';
import {
  InvalidPricingQuoteRequestError,
  PricingDependencyUnavailableError,
} from './pricing.errors';
import { PricingMode, PricingQuoteSummary } from './pricing.types';

@Controller('v1/provider/pricing')
export class ProviderPricingController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly pricingServiceClient: PricingServiceClient,
  ) {}

  @Post('guidance')
  async guidance(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      serviceId?: string;
      categoryId?: string | null;
      categoryName?: string | null;
      serviceTitle?: string | null;
      proposedPrice?: number;
      pricingMode?: PricingMode | null;
      estimatedHours?: number | null;
    },
  ): Promise<{ data: PricingQuoteSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const provider = await this.catalogServiceClient.findProviderProfileByUserId(
        userId,
      );

      if (
        !provider?.id ||
        !body.serviceId ||
        body.proposedPrice === undefined ||
        !Number.isFinite(body.proposedPrice) ||
        body.proposedPrice <= 0
      ) {
        throw new InvalidPricingQuoteRequestError();
      }
      const proposedPrice = Number(body.proposedPrice);

      return {
        data: await this.pricingServiceClient.createQuote({
          customerId: userId,
          providerId: provider.id,
          serviceId: body.serviceId,
          categoryId: body.categoryId ?? null,
          categoryName: body.categoryName ?? body.serviceTitle ?? 'Provider service',
          serviceTitle: body.serviceTitle ?? 'Provider service',
          providerBasePrice: proposedPrice,
          pricingMode: body.pricingMode ?? 'flat',
          serviceAddress: 'Provider pricing guidance',
          scheduledAt: new Date().toISOString(),
          hoursRequired: body.estimatedHours ?? 1,
          bookingUrgency: 'standard',
          distanceKm: null,
          durationMinutes: null,
          region: 'default',
        }),
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
    if (error instanceof InvalidPricingQuoteRequestError) {
      return this.error(
        'invalid_pricing_quote_request',
        'Provider pricing guidance request is invalid.',
        400,
      );
    }
    if (error instanceof PricingDependencyUnavailableError) {
      return this.error(
        'pricing_dependency_unavailable',
        'Pricing service is unavailable.',
        503,
      );
    }
    return this.error('pricing_dependency_unavailable', 'Pricing guidance failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
