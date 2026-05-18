import { PricingEngineRepository } from './pricing-engine.repository';

describe('PricingEngineRepository', () => {
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
