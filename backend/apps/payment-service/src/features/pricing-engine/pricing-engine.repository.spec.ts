import { PricingEngineRepository } from './pricing-engine.repository';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('PricingEngineRepository', () => {
  it('keeps pricing rule upsert SQL return filters unambiguous', () => {
    const migration = fs.readFileSync(
      path.resolve(__dirname, '../../../../../database/20260519_add_pricing_engine.sql'),
      'utf8',
    );

    expect(migration).toContain(
      'from public.servease_admin_list_pricing_rules() as pricing_rule_row',
    );
    expect(migration).toContain('where pricing_rule_row.id = v_rule_id');
    expect(migration).toContain(
      'on conflict on constraint pricing_category_rules_pkey do update set',
    );
    expect(migration).toContain(
      'from public.servease_admin_list_pricing_fuel_index() as fuel_index_row',
    );
    expect(migration).toContain('where fuel_index_row.id = v_id');
  });

  it('upserts admin pricing rules through the payment-owned RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'rule-1',
        category_id: null,
        category_name: 'Default services',
        pricing_mode: 'any',
        baseline_min: 300,
        baseline_max: 5000,
        fair_band_percent: 15,
        travel_fee_min: 0,
        travel_fee_max: 500,
        travel_multiplier: 1.2,
        travel_time_fee_per_minute: 2,
        urgency_priority_multiplier: 0.1,
        urgency_emergency_multiplier: 0.25,
        outlier_warn_percent: 20,
        is_active: true,
        updated_at: '2026-05-19T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new PricingEngineRepository({ rpc });

    const rule = await repository.upsertRule({
      ruleId: 'rule-1',
      categoryId: null,
      categoryName: 'Default services',
      pricingMode: 'any',
      baselineMin: 300,
      baselineMax: 5000,
      fairBandPercent: 15,
      travelFeeMin: 0,
      travelFeeMax: 500,
      travelMultiplier: 1.2,
      travelTimeFeePerMinute: 2,
      urgencyPriorityMultiplier: 0.1,
      urgencyEmergencyMultiplier: 0.25,
      outlierWarnPercent: 20,
      isActive: true,
      adminUserId: 'admin-1',
    });

    expect(rpc).toHaveBeenCalledWith('servease_admin_upsert_pricing_rule', {
      p_rule_id: 'rule-1',
      p_category_id: null,
      p_category_name: 'Default services',
      p_pricing_mode: 'any',
      p_baseline_min: 300,
      p_baseline_max: 5000,
      p_fair_band_percent: 15,
      p_travel_fee_min: 0,
      p_travel_fee_max: 500,
      p_travel_multiplier: 1.2,
      p_travel_time_fee_per_minute: 2,
      p_urgency_priority_multiplier: 0.1,
      p_urgency_emergency_multiplier: 0.25,
      p_outlier_warn_percent: 20,
      p_is_active: true,
      p_admin_user_id: 'admin-1',
    });
    expect(rule.id).toBe('rule-1');
  });

  it('creates pricing quotes through the payment-owned RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'quote-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        service_id: 'service-1',
        category_id: 'category-1',
        expires_at: '2026-06-01T08:45:00.000Z',
        estimated_total: 1450,
        fair_range_min: 1200,
        fair_range_max: 1550,
        fairness_status: 'within_range',
        confidence: 'high',
        line_items: [{ code: 'labor', label: 'Labor', amount: 1200 }],
        signals: {
          distanceKm: 8,
          durationMinutes: 20,
          fuelPricePerLiter: 68,
          fuelIndexUpdatedAt: '2026-05-19T00:00:00.000Z',
          staleFuelIndex: false,
          fallbackUsed: false,
        },
        explanation: 'Within range.',
        created_at: '2026-05-19T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new PricingEngineRepository({ rpc });

    const quote = await repository.createQuote({
      customerId: 'customer-1',
      providerId: 'provider-1',
      serviceId: 'service-1',
      categoryId: 'category-1',
      expiresAt: '2026-06-01T08:45:00.000Z',
      currency: 'PHP',
      estimatedTotal: 1450,
      fairRangeMin: 1200,
      fairRangeMax: 1550,
      fairnessStatus: 'within_range',
      confidence: 'high',
      lineItems: [{ code: 'labor', label: 'Labor', amount: 1200 }],
      signals: {
        distanceKm: 8,
        durationMinutes: 20,
        fuelPricePerLiter: 68,
        fuelIndexUpdatedAt: '2026-05-19T00:00:00.000Z',
        staleFuelIndex: false,
        fallbackUsed: false,
      },
      explanation: 'Within range.',
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_pricing_quote', {
      p_customer_id: 'customer-1',
      p_provider_id: 'provider-1',
      p_service_id: 'service-1',
      p_category_id: 'category-1',
      p_expires_at: '2026-06-01T08:45:00.000Z',
      p_estimated_total: 1450,
      p_fair_range_min: 1200,
      p_fair_range_max: 1550,
      p_fairness_status: 'within_range',
      p_confidence: 'high',
      p_line_items: [{ code: 'labor', label: 'Labor', amount: 1200 }],
      p_signals: {
        distanceKm: 8,
        durationMinutes: 20,
        fuelPricePerLiter: 68,
        fuelIndexUpdatedAt: '2026-05-19T00:00:00.000Z',
        staleFuelIndex: false,
        fallbackUsed: false,
      },
      p_explanation: 'Within range.',
    });
    expect(quote.quoteId).toBe('quote-1');
  });

  it('validates accepted quotes through the payment-owned RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'quote-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        service_id: 'service-1',
        category_id: 'category-1',
        expires_at: '2026-06-01T08:45:00.000Z',
        estimated_total: 1450,
        fair_range_min: 1200,
        fair_range_max: 1550,
        fairness_status: 'within_range',
        confidence: 'high',
        pricing_mode: 'flat',
        created_at: '2026-05-19T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new PricingEngineRepository({ rpc });

    const quote = await repository.validateQuote('quote-1');

    expect(rpc).toHaveBeenCalledWith('servease_validate_pricing_quote', {
      p_quote_id: 'quote-1',
    });
    expect(quote.amount).toBe(1450);
    expect(quote.pricingMode).toBe('flat');
  });
});
