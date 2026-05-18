import { Body, Controller, Headers, HttpException, Post } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidPricingQuoteRequestError,
  PricingDependencyUnavailableError,
  PricingQuoteExpiredError,
  PricingQuoteNotFoundError,
  ProviderListingNotFoundError,
} from './pricing.errors';
import { PricingGatewayService } from './pricing.service';
import { CreatePricingQuoteRequest, PricingQuoteSummary } from './pricing.types';

@Controller('v1/pricing')
export class PricingController {
  constructor(
    private readonly pricingGatewayService: PricingGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post('quotes')
  async createQuote(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreatePricingQuoteRequest,
  ): Promise<{ data: PricingQuoteSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return { data: await this.pricingGatewayService.createQuote(userId, body) };
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
        'Pricing quote request is invalid.',
        400,
      );
    }

    if (error instanceof ProviderListingNotFoundError) {
      return this.error(
        'provider_listing_not_found',
        'Provider listing was not found.',
        404,
      );
    }

    if (error instanceof PricingQuoteNotFoundError) {
      return this.error('pricing_quote_not_found', 'Pricing quote was not found.', 404);
    }

    if (error instanceof PricingQuoteExpiredError) {
      return this.error('pricing_quote_expired', 'Pricing quote expired.', 409);
    }

    if (error instanceof PricingDependencyUnavailableError) {
      return this.error(
        'pricing_dependency_unavailable',
        'Pricing service is unavailable.',
        503,
      );
    }

    return this.error('pricing_dependency_unavailable', 'Pricing request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
