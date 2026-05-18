import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  PricingCategoryRuleSummary,
  PricingConfidence,
  PricingFairnessStatus,
  PricingFuelIndexSummary,
  PricingMode,
  PricingQuoteAuditSummary,
  PricingQuoteLineItem,
  PricingQuoteSignals,
  PricingQuoteSummary,
  PricingQuoteValidationResult,
  UpsertPricingCategoryRuleInput,
  CreatePricingFuelIndexInput,
} from './pricing-engine.types';
import { PricingQuoteNotFoundError } from './pricing-engine.errors';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: unknown[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: unknown | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface PricingRuleRow {
  id: string;
  category_id: string | null;
  category_name: string;
  pricing_mode: PricingMode | 'any';
  baseline_min: string | number | null;
  baseline_max: string | number | null;
  fair_band_percent: string | number | null;
  travel_fee_min: string | number | null;
  travel_fee_max: string | number | null;
  travel_multiplier: string | number | null;
  travel_time_fee_per_minute: string | number | null;
  urgency_priority_multiplier: string | number | null;
  urgency_emergency_multiplier: string | number | null;
  outlier_warn_percent: string | number | null;
  is_active: boolean | null;
  updated_at: string | null;
}

interface FuelIndexRow {
  id: string;
  region: string;
  fuel_price_per_liter: string | number | null;
  source: string | null;
  effective_at: string;
  created_by: string | null;
  created_at: string | null;
}

interface QuoteRow {
  id?: string;
  quote_id?: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  category_id: string | null;
  expires_at: string;
  estimated_total: string | number | null;
  fair_range_min: string | number | null;
  fair_range_max: string | number | null;
  fairness_status: PricingFairnessStatus;
  confidence: PricingConfidence;
  pricing_mode?: PricingMode | null;
  line_items?: PricingQuoteLineItem[] | null;
  signals?: PricingQuoteSignals | null;
  explanation?: string | null;
  created_at: string | null;
}

@Injectable()
export class PricingEngineRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async listRules(): Promise<PricingCategoryRuleSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_pricing_rules',
      {},
    );

    if (error) {
      throw new Error(`Failed to list pricing rules: ${error.message}`);
    }

    return ((data ?? []) as PricingRuleRow[]).map((row) => this.mapRule(row));
  }

  async upsertRule(
    input: UpsertPricingCategoryRuleInput,
  ): Promise<PricingCategoryRuleSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_upsert_pricing_rule', {
        p_rule_id: input.ruleId ?? null,
        p_category_id: input.categoryId ?? null,
        p_category_name: input.categoryName,
        p_pricing_mode: input.pricingMode ?? 'any',
        p_baseline_min: input.baselineMin,
        p_baseline_max: input.baselineMax,
        p_fair_band_percent: input.fairBandPercent ?? 15,
        p_travel_fee_min: input.travelFeeMin ?? 0,
        p_travel_fee_max: input.travelFeeMax ?? 500,
        p_travel_multiplier: input.travelMultiplier ?? 1.2,
        p_travel_time_fee_per_minute: input.travelTimeFeePerMinute ?? 2,
        p_urgency_priority_multiplier: input.urgencyPriorityMultiplier ?? 0.1,
        p_urgency_emergency_multiplier: input.urgencyEmergencyMultiplier ?? 0.25,
        p_outlier_warn_percent: input.outlierWarnPercent ?? 20,
        p_is_active: input.isActive ?? true,
        p_admin_user_id: input.adminUserId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to upsert pricing rule: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to upsert pricing rule: missing row');
    }

    return this.mapRule(data as PricingRuleRow);
  }

  async listFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_pricing_fuel_index',
      {},
    );

    if (error) {
      throw new Error(`Failed to list pricing fuel index: ${error.message}`);
    }

    return ((data ?? []) as FuelIndexRow[]).map((row) => this.mapFuelIndex(row));
  }

  async createFuelIndex(
    input: CreatePricingFuelIndexInput,
  ): Promise<PricingFuelIndexSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_pricing_fuel_index', {
        p_region: input.region,
        p_fuel_price_per_liter: input.fuelPricePerLiter,
        p_source: input.source ?? null,
        p_effective_at: input.effectiveAt ?? new Date().toISOString(),
        p_admin_user_id: input.adminUserId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create pricing fuel index: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create pricing fuel index: missing row');
    }

    return this.mapFuelIndex(data as FuelIndexRow);
  }

  async createQuote(
    input: Omit<PricingQuoteSummary, 'quoteId' | 'createdAt'>,
  ): Promise<PricingQuoteSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_pricing_quote', {
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_service_id: input.serviceId,
        p_category_id: input.categoryId,
        p_expires_at: input.expiresAt,
        p_estimated_total: input.estimatedTotal,
        p_fair_range_min: input.fairRangeMin,
        p_fair_range_max: input.fairRangeMax,
        p_fairness_status: input.fairnessStatus,
        p_confidence: input.confidence,
        p_line_items: input.lineItems,
        p_signals: input.signals,
        p_explanation: input.explanation,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create pricing quote: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create pricing quote: missing row');
    }

    return this.mapQuote(data as QuoteRow);
  }

  async validateQuote(quoteId: string): Promise<PricingQuoteValidationResult> {
    const { data, error } = await this.client
      .rpc('servease_validate_pricing_quote', {
        p_quote_id: quoteId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('pricing_quote_not_found')) {
        throw new PricingQuoteNotFoundError();
      }
      throw new Error(`Failed to validate pricing quote: ${error.message}`);
    }

    if (!data) {
      throw new PricingQuoteNotFoundError();
    }

    const row = data as QuoteRow;
    return {
      quoteId: row.id ?? row.quote_id ?? quoteId,
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      amount: Number(row.estimated_total ?? 0),
      pricingMode: row.pricing_mode ?? 'flat',
      fairnessStatus: row.fairness_status,
      confidence: row.confidence,
      expiresAt: row.expires_at,
    };
  }

  async listQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_pricing_quote_audits',
      {},
    );

    if (error) {
      throw new Error(`Failed to list pricing quote audits: ${error.message}`);
    }

    return ((data ?? []) as QuoteRow[]).map((row) => ({
      quoteId: row.id ?? row.quote_id ?? '',
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      categoryId: row.category_id,
      estimatedTotal: Number(row.estimated_total ?? 0),
      fairRangeMin: Number(row.fair_range_min ?? 0),
      fairRangeMax: Number(row.fair_range_max ?? 0),
      fairnessStatus: row.fairness_status,
      confidence: row.confidence,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }));
  }

  private mapRule(row: PricingRuleRow): PricingCategoryRuleSummary {
    return {
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      pricingMode: row.pricing_mode,
      baselineMin: Number(row.baseline_min ?? 0),
      baselineMax: Number(row.baseline_max ?? 0),
      fairBandPercent: Number(row.fair_band_percent ?? 15),
      travelFeeMin: Number(row.travel_fee_min ?? 0),
      travelFeeMax: Number(row.travel_fee_max ?? 500),
      travelMultiplier: Number(row.travel_multiplier ?? 1.2),
      travelTimeFeePerMinute: Number(row.travel_time_fee_per_minute ?? 2),
      urgencyPriorityMultiplier: Number(row.urgency_priority_multiplier ?? 0.1),
      urgencyEmergencyMultiplier: Number(row.urgency_emergency_multiplier ?? 0.25),
      outlierWarnPercent: Number(row.outlier_warn_percent ?? 20),
      isActive: row.is_active ?? true,
      updatedAt: row.updated_at,
    };
  }

  private mapFuelIndex(row: FuelIndexRow): PricingFuelIndexSummary {
    return {
      id: row.id,
      region: row.region,
      fuelPricePerLiter: Number(row.fuel_price_per_liter ?? 0),
      source: row.source,
      effectiveAt: row.effective_at,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }

  private mapQuote(row: QuoteRow): PricingQuoteSummary {
    return {
      quoteId: row.id ?? row.quote_id ?? '',
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      categoryId: row.category_id,
      expiresAt: row.expires_at,
      currency: 'PHP',
      estimatedTotal: Number(row.estimated_total ?? 0),
      fairRangeMin: Number(row.fair_range_min ?? 0),
      fairRangeMax: Number(row.fair_range_max ?? 0),
      fairnessStatus: row.fairness_status,
      confidence: row.confidence,
      lineItems: row.line_items ?? [],
      signals:
        row.signals ??
        ({
          distanceKm: null,
          durationMinutes: null,
          fuelPricePerLiter: 0,
          fuelIndexUpdatedAt: null,
          staleFuelIndex: true,
          fallbackUsed: true,
        } satisfies PricingQuoteSignals),
      explanation: row.explanation ?? '',
      createdAt: row.created_at,
    };
  }
}
