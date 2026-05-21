import { Body, Controller, Get, HttpException, Post, Put } from '@nestjs/common';
import { AdminPricingService } from './admin-pricing.service';
import { PaymentServiceRequestError } from './clients/payment-service.client';
import {
  CreatePricingFuelIndexRequest,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  SyncPricingFuelIndexRequest,
  UpsertPricingCategoryRuleRequest,
} from './admin-payment.types';

@Controller('internal/admin/pricing')
export class AdminPricingController {
  constructor(private readonly adminPricingService: AdminPricingService) {}

  @Get('rules')
  async listRules(): Promise<{ data: PricingCategoryRuleSummary[] }> {
    try {
      return { data: await this.adminPricingService.listRules() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('rules')
  async upsertRule(
    @Body() body: UpsertPricingCategoryRuleRequest,
  ): Promise<{ data: PricingCategoryRuleSummary }> {
    try {
      return { data: await this.adminPricingService.upsertRule(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('fuel-index')
  async listFuelIndex(): Promise<{ data: PricingFuelIndexSummary[] }> {
    try {
      return { data: await this.adminPricingService.listFuelIndex() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('fuel-index')
  async createFuelIndex(
    @Body() body: CreatePricingFuelIndexRequest,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      return { data: await this.adminPricingService.createFuelIndex(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('fuel-index/sync')
  async syncFuelIndexFromGasWatch(
    @Body() body: SyncPricingFuelIndexRequest,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      return {
        data: await this.adminPricingService.syncFuelIndexFromGasWatch(body ?? {}),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('quote-audits')
  async listQuoteAudits(): Promise<{ data: PricingQuoteAuditSummary[] }> {
    try {
      return { data: await this.adminPricingService.listQuoteAudits() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof PaymentServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }
    const code = error instanceof Error ? error.message : 'admin_dependency_unavailable';
    if (code === 'invalid_pricing_rule_request') {
      return this.error('invalid_pricing_rule_request', 'Pricing rule is invalid.', 400);
    }
    return this.error(
      'admin_dependency_unavailable',
      'Admin pricing workflow failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
