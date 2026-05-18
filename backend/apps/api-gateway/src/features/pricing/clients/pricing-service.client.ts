import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InvalidPricingQuoteRequestError,
  InvalidPricingRuleRequestError,
  PricingDependencyUnavailableError,
  PricingQuoteExpiredError,
  PricingQuoteNotFoundError,
} from '../pricing.errors';
import {
  CreatePricingFuelIndexRequest,
  InternalCreatePricingQuoteRequest,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  PricingQuoteSummary,
  PricingQuoteValidationResult,
  UpsertPricingCategoryRuleRequest,
} from '../pricing.types';

@Injectable()
export class PricingServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createQuote(input: InternalCreatePricingQuoteRequest): Promise<PricingQuoteSummary> {
    return this.request<PricingQuoteSummary>('/internal/pricing/quotes', 'POST', input);
  }

  validateQuote(quoteId: string): Promise<PricingQuoteValidationResult> {
    return this.request<PricingQuoteValidationResult>(
      `/internal/pricing/quotes/${encodeURIComponent(quoteId)}/validation`,
      'GET',
    );
  }

  listRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.request<PricingCategoryRuleSummary[]>(
      '/internal/pricing/admin/rules',
      'GET',
    );
  }

  upsertRule(
    input: UpsertPricingCategoryRuleRequest & { adminUserId: string },
  ): Promise<PricingCategoryRuleSummary> {
    return this.request<PricingCategoryRuleSummary>(
      '/internal/pricing/admin/rules',
      'PUT',
      input,
    );
  }

  listFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.request<PricingFuelIndexSummary[]>(
      '/internal/pricing/admin/fuel-index',
      'GET',
    );
  }

  createFuelIndex(
    input: CreatePricingFuelIndexRequest & { adminUserId: string },
  ): Promise<PricingFuelIndexSummary> {
    return this.request<PricingFuelIndexSummary>(
      '/internal/pricing/admin/fuel-index',
      'POST',
      input,
    );
  }

  listQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.request<PricingQuoteAuditSummary[]>(
      '/internal/pricing/admin/quote-audits',
      'GET',
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://localhost:8507',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_pricing_quote_request') {
        throw new InvalidPricingQuoteRequestError();
      }
      if (code === 'invalid_pricing_rule_request') {
        throw new InvalidPricingRuleRequestError();
      }
      if (code === 'pricing_quote_not_found') {
        throw new PricingQuoteNotFoundError();
      }
      if (code === 'pricing_quote_expired') {
        throw new PricingQuoteExpiredError();
      }
      throw new PricingDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: { code?: string };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
