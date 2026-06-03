import assert from 'node:assert/strict';
import test from 'node:test';
import { isPricingQuoteFresh } from '../../../shared/utils/booking';
import type { PricingQuoteSummary } from '../../../shared/models/types';

const freshQuote: PricingQuoteSummary = {
  quoteId: 'quote-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceAddress: '123 Test St',
  scheduledAt: '2026-06-03T08:00:00.000Z',
  hoursRequired: 2,
  pricingMode: 'flat',
  expiresAt: '2026-06-03T08:10:00.000Z',
  currency: 'PHP',
  estimatedTotal: 1200,
  fairRangeMin: 1000,
  fairRangeMax: 1400,
  fairnessStatus: 'within_range',
  confidence: 'high',
  lineItems: [],
  signals: {
    distanceKm: null,
    durationMinutes: null,
    fuelPricePerLiter: 68,
    fuelIndexUpdatedAt: '2026-06-01T00:00:00.000Z',
    staleFuelIndex: false,
    fallbackUsed: false,
  },
  explanation: 'Within typical rates.',
};

test('pricing quote freshness requires matching booking context when provided', () => {
  const now = new Date('2026-06-03T08:00:00.000Z').getTime();

  assert.equal(
    isPricingQuoteFresh(freshQuote, now, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: ' 123   Test St ',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    true,
  );

  assert.equal(
    isPricingQuoteFresh(freshQuote, now, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '456 Other St',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    false,
  );
});

test('contextless pricing quotes are stale when booking context must be checked', () => {
  const contextlessQuote: PricingQuoteSummary = {
    quoteId: freshQuote.quoteId,
    customerId: freshQuote.customerId,
    providerId: freshQuote.providerId,
    serviceId: freshQuote.serviceId,
    expiresAt: freshQuote.expiresAt,
    currency: freshQuote.currency,
    estimatedTotal: freshQuote.estimatedTotal,
    fairRangeMin: freshQuote.fairRangeMin,
    fairRangeMax: freshQuote.fairRangeMax,
    fairnessStatus: freshQuote.fairnessStatus,
    confidence: freshQuote.confidence,
    lineItems: freshQuote.lineItems,
    signals: freshQuote.signals,
    explanation: freshQuote.explanation,
  };

  assert.equal(
    isPricingQuoteFresh(contextlessQuote, Date.now(), {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    false,
  );
});
