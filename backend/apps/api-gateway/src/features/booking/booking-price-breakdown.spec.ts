import { buildBookingPriceBreakdown } from './booking-price-breakdown';

describe('buildBookingPriceBreakdown', () => {
  it('uses the provider rate as the service subtotal for flat pricing', () => {
    const breakdown = buildBookingPriceBreakdown({
      serviceRate: 1500,
      pricingMode: 'flat',
      hoursRequired: 3,
      generatedAt: '2026-07-20T07:50:00.000Z',
    });

    expect(breakdown.serviceSubtotal).toBe(1500);
    expect(breakdown.metadata).toMatchObject({
      pricingMode: 'flat',
      hoursRequired: 3,
      serviceRate: 1500,
    });
  });

  it('multiplies the provider rate by duration for hourly pricing', () => {
    const breakdown = buildBookingPriceBreakdown({
      serviceRate: 500,
      pricingMode: 'hourly',
      hoursRequired: 3,
      generatedAt: '2026-07-20T07:50:00.000Z',
    });

    expect(breakdown.serviceSubtotal).toBe(1500);
    expect(breakdown.lineItems[0]).toMatchObject({
      code: 'service_subtotal',
      amount: 1500,
      source: 'provider_rate',
    });
  });

  it('calculates travel and fuel from route distance and duration', () => {
    const breakdown = buildBookingPriceBreakdown({
      serviceRate: 1500,
      pricingMode: 'flat',
      route: {
        distanceMeters: 5000,
        durationSeconds: 900,
      },
      generatedAt: '2026-07-20T07:50:00.000Z',
    });

    expect(breakdown.travelFee).toBe(180);
    expect(breakdown.fallbackUsed).toBe(false);
    expect(breakdown.calculationSource).toBe('route');
    expect(breakdown.lineItems[1]).toMatchObject({
      label: 'Travel and fuel',
      amount: 180,
      source: 'route',
    });
  });

  it('uses a labeled travel and fuel fallback when route data is unavailable', () => {
    const breakdown = buildBookingPriceBreakdown({
      serviceRate: 1500,
      pricingMode: 'flat',
      fallbackReason: 'provider_origin_unavailable',
      generatedAt: '2026-07-20T07:50:00.000Z',
    });

    expect(breakdown.travelFee).toBe(120);
    expect(breakdown.fallbackUsed).toBe(true);
    expect(breakdown.calculationSource).toBe('fallback');
    expect(breakdown.lineItems[1]).toMatchObject({
      label: 'Travel and fuel estimate',
      amount: 120,
      source: 'fallback',
    });
    expect(breakdown.metadata.fallbackReason).toBe(
      'provider_origin_unavailable',
    );
  });
});
