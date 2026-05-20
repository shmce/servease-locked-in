import { Body, Controller, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import {
  PricingFuelSyncUnavailableError,
  InvalidPricingQuoteRequestError,
  InvalidPricingRuleRequestError,
  PricingQuoteExpiredError,
  PricingQuoteNotFoundError,
} from './pricing-engine.errors';
import { PricingEngineService } from './pricing-engine.service';
import {
  CreatePricingFuelIndexInput,
  CreatePricingQuoteInput,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  PricingQuoteSummary,
  PricingQuoteValidationResult,
  SyncPricingFuelIndexInput,
  UpsertPricingCategoryRuleInput,
} from './pricing-engine.types';

@Controller('internal/pricing')
export class PricingEngineController {
  constructor(private readonly pricingEngineService: PricingEngineService) {}

  @Post('quotes')
  async createQuote(
    @Body() body: CreatePricingQuoteInput,
  ): Promise<{ data: PricingQuoteSummary }> {
    try {
      return { data: await this.pricingEngineService.createQuote(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('quotes/:quoteId/validation')
  async validateQuote(
    @Param('quoteId') quoteId: string,
  ): Promise<{ data: PricingQuoteValidationResult }> {
    try {
      return { data: await this.pricingEngineService.validateQuote(quoteId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('admin/rules')
  async listRules(): Promise<{ data: PricingCategoryRuleSummary[] }> {
    try {
      return { data: await this.pricingEngineService.listRules() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('admin/rules')
  async upsertRule(
    @Body() body: UpsertPricingCategoryRuleInput,
  ): Promise<{ data: PricingCategoryRuleSummary }> {
    try {
      return { data: await this.pricingEngineService.upsertRule(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('admin/fuel-index')
  async listFuelIndex(): Promise<{ data: PricingFuelIndexSummary[] }> {
    try {
      return { data: await this.pricingEngineService.listFuelIndex() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('admin/fuel-index')
  async createFuelIndex(
    @Body() body: CreatePricingFuelIndexInput,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      return { data: await this.pricingEngineService.createFuelIndex(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('admin/fuel-index/sync')
  async syncFuelIndexFromGasWatch(
    @Body() body: SyncPricingFuelIndexInput,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      return {
        data: await this.pricingEngineService.syncFuelIndexFromGasWatch(body ?? {}),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('admin/quote-audits')
  async listQuoteAudits(): Promise<{ data: PricingQuoteAuditSummary[] }> {
    try {
      return { data: await this.pricingEngineService.listQuoteAudits() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidPricingQuoteRequestError) {
      return this.error(
        'invalid_pricing_quote_request',
        'Pricing quote request is invalid.',
        400,
      );
    }

    if (error instanceof InvalidPricingRuleRequestError) {
      return this.error(
        'invalid_pricing_rule_request',
        'Pricing rule request is invalid.',
        400,
      );
    }

    if (error instanceof PricingFuelSyncUnavailableError) {
      return this.error(
        'pricing_fuel_sync_unavailable',
        'GasWatch PH fuel price sync is unavailable.',
        503,
      );
    }

    if (error instanceof PricingQuoteNotFoundError) {
      return this.error('pricing_quote_not_found', 'Pricing quote was not found.', 404);
    }

    if (error instanceof PricingQuoteExpiredError) {
      return this.error('pricing_quote_expired', 'Pricing quote expired.', 409);
    }

    return this.error(
      'pricing_dependency_unavailable',
      'Pricing service is unavailable.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
