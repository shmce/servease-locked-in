import { Test } from '@nestjs/testing';
import {
  InvalidPricingQuoteRequestError,
  InvalidPricingRuleRequestError,
  PricingFuelSyncUnavailableError,
  PricingQuoteExpiredError,
} from './pricing-engine.errors';
import { PricingEngineRepository } from './pricing-engine.repository';
import { PricingEngineService } from './pricing-engine.service';
import { PricingFuelPriceProvider } from './pricing-engine.types';

describe('PricingEngineService', () => {
  const freshFuel = {
    id: 'fuel-1',
    region: 'default',
    fuelPricePerLiter: 68,
    source: 'admin',
    effectiveAt: new Date().toISOString(),
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
  };

  const rule = {
    id: 'rule-1',
    categoryId: 'category-1',
    categoryName: 'Home Cleaning',
    pricingMode: 'any' as const,
    baselineMin: 300,
    baselineMax: 5000,
    fairBandPercent: 15,
    travelFeeMin: 0,
    travelFeeMax: 700,
    travelMultiplier: 1.2,
    travelTimeFeePerMinute: 2,
    urgencyPriorityMultiplier: 0.1,
    urgencyEmergencyMultiplier: 0.25,
    outlierWarnPercent: 20,
    isActive: true,
    updatedAt: null,
  };

  it('resolves through Nest dependency injection with the default fuel price provider', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PricingEngineService,
        {
          provide: PricingEngineRepository,
          useValue: {},
        },
      ],
    }).compile();

    expect(moduleRef.get(PricingEngineService)).toBeInstanceOf(
      PricingEngineService,
    );

    await moduleRef.close();
  });

  it('calculates and persists a gas-aware fair quote', async () => {
    const repository = {
      listRules: jest.fn().mockResolvedValue([rule]),
      listFuelIndex: jest.fn().mockResolvedValue([freshFuel]),
      createQuote: jest.fn(async (quote) => ({
        quoteId: 'quote-1',
        createdAt: '2026-05-19T00:00:00.000Z',
        ...quote,
      })),
    } as unknown as PricingEngineRepository;
    const service = new PricingEngineService(repository);

    const quote = await service.createQuote({
      customerId: 'customer-1',
      providerId: 'provider-1',
      serviceId: 'service-1',
      categoryId: 'category-1',
      categoryName: 'Home Cleaning',
      serviceAddress: '123 Street',
      scheduledAt: '2026-06-01T09:00:00.000Z',
      providerBasePrice: 600,
      pricingMode: 'hourly',
      hoursRequired: 2,
      distanceKm: 10,
      durationMinutes: 25,
      bookingUrgency: 'priority',
    });

    expect(repository.createQuote).toHaveBeenCalled();
    expect(quote.estimatedTotal).toBeGreaterThan(1200);
    expect(quote.signals.fuelPricePerLiter).toBe(68);
    expect(quote.signals.fallbackUsed).toBe(false);
    expect(quote.confidence).toBe('high');
  });

  it('marks quotes lower confidence when travel distance and fuel index are fallback values', async () => {
    const repository = {
      listRules: jest.fn().mockResolvedValue([]),
      listFuelIndex: jest.fn().mockResolvedValue([]),
      createQuote: jest.fn(async (quote) => ({
        quoteId: 'quote-1',
        createdAt: null,
        ...quote,
      })),
    } as unknown as PricingEngineRepository;
    const service = new PricingEngineService(repository);

    const quote = await service.createQuote({
      customerId: 'customer-1',
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '123 Street',
      scheduledAt: '2026-06-01T09:00:00.000Z',
      providerBasePrice: 900,
      pricingMode: 'flat',
    });

    expect(quote.confidence).toBe('low');
    expect(quote.signals.fallbackUsed).toBe(true);
    expect(quote.explanation).toMatch(/fallback travel or gas inputs/);
  });

  it('rejects invalid quote requests before repository writes', async () => {
    const repository = {
      listRules: jest.fn(),
      listFuelIndex: jest.fn(),
      createQuote: jest.fn(),
    } as unknown as PricingEngineRepository;
    const service = new PricingEngineService(repository);

    await expect(
      service.createQuote({
        customerId: '',
        providerId: 'provider-1',
        serviceId: 'service-1',
        serviceAddress: '',
        scheduledAt: '2026-06-01T09:00:00.000Z',
        providerBasePrice: 0,
        pricingMode: 'flat',
      }),
    ).rejects.toBeInstanceOf(InvalidPricingQuoteRequestError);
    expect(repository.createQuote).not.toHaveBeenCalled();
  });

  it('rejects expired accepted quotes', async () => {
    const repository = {
      validateQuote: jest.fn().mockResolvedValue({
        quoteId: 'quote-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        serviceId: 'service-1',
        amount: 1000,
        pricingMode: 'flat',
        fairnessStatus: 'within_range',
        confidence: 'high',
        expiresAt: '2026-01-01T00:00:00.000Z',
      }),
    } as unknown as PricingEngineRepository;
    const service = new PricingEngineService(repository);

    await expect(service.validateQuote('quote-1')).rejects.toBeInstanceOf(
      PricingQuoteExpiredError,
    );
  });

  it('validates admin pricing rules before persistence', () => {
    const repository = {
      upsertRule: jest.fn(),
    } as unknown as PricingEngineRepository;
    const service = new PricingEngineService(repository);

    expect(() =>
      service.upsertRule({
        categoryName: '',
        baselineMin: 1000,
        baselineMax: 500,
        adminUserId: 'admin-1',
      }),
    ).toThrow(InvalidPricingRuleRequestError);
    expect(repository.upsertRule).not.toHaveBeenCalled();
  });

  it('syncs the fuel index from GasWatch PH through payment-owned snapshots', async () => {
    const repository = {
      listFuelIndex: jest.fn().mockResolvedValue([]),
      createFuelIndex: jest.fn(async (input) => ({
        id: 'fuel-gaswatch-1',
        region: input.region,
        fuelPricePerLiter: input.fuelPricePerLiter,
        source: input.source,
        effectiveAt: input.effectiveAt,
        createdBy: input.adminUserId,
        createdAt: '2026-05-19T01:00:00.000Z',
      })),
    } as unknown as PricingEngineRepository;
    const fuelPriceProvider = {
      getLatestFuelPrice: jest.fn().mockResolvedValue({
        region: 'default',
        fuelType: 'diesel',
        pricePerLiter: 89.84,
        source: 'gaswatch-ph:diesel:metro-manila-average',
        effectiveAt: '2026-05-19T00:00:00.000Z',
      }),
    } as PricingFuelPriceProvider;
    const service = new PricingEngineService(repository, fuelPriceProvider);

    const row = await service.syncFuelIndexFromGasWatch({
      adminUserId: 'admin-1',
    });

    expect(fuelPriceProvider.getLatestFuelPrice).toHaveBeenCalled();
    expect(repository.createFuelIndex).toHaveBeenCalledWith({
      region: 'default',
      fuelPricePerLiter: 89.84,
      source: 'gaswatch-ph:diesel:metro-manila-average',
      effectiveAt: '2026-05-19T00:00:00.000Z',
      adminUserId: 'admin-1',
    });
    expect(row.source).toBe('gaswatch-ph:diesel:metro-manila-average');
  });

  it('returns the existing GasWatch PH snapshot when the source has not changed', async () => {
    const existing = {
      id: 'fuel-existing',
      region: 'default',
      fuelPricePerLiter: 89.84,
      source: 'gaswatch-ph:diesel:metro-manila-average',
      effectiveAt: '2026-05-19T00:00:00.000Z',
      createdBy: null,
      createdAt: '2026-05-19T01:00:00.000Z',
    };
    const repository = {
      listFuelIndex: jest.fn().mockResolvedValue([existing]),
      createFuelIndex: jest.fn(),
    } as unknown as PricingEngineRepository;
    const fuelPriceProvider = {
      getLatestFuelPrice: jest.fn().mockResolvedValue({
        region: 'default',
        fuelType: 'diesel',
        pricePerLiter: 89.84,
        source: 'gaswatch-ph:diesel:metro-manila-average',
        effectiveAt: '2026-05-19T00:00:00.000Z',
      }),
    } as PricingFuelPriceProvider;
    const service = new PricingEngineService(repository, fuelPriceProvider);

    await expect(service.syncFuelIndexFromGasWatch()).resolves.toBe(existing);
    expect(repository.createFuelIndex).not.toHaveBeenCalled();
  });

  it('fails closed when GasWatch PH returns an invalid fuel price', async () => {
    const repository = {
      listFuelIndex: jest.fn(),
      createFuelIndex: jest.fn(),
    } as unknown as PricingEngineRepository;
    const fuelPriceProvider = {
      getLatestFuelPrice: jest.fn().mockResolvedValue({
        region: 'default',
        fuelType: 'diesel',
        pricePerLiter: 0,
        source: 'gaswatch-ph:diesel:metro-manila-average',
        effectiveAt: '2026-05-19T00:00:00.000Z',
      }),
    } as PricingFuelPriceProvider;
    const service = new PricingEngineService(repository, fuelPriceProvider);

    await expect(service.syncFuelIndexFromGasWatch()).rejects.toBeInstanceOf(
      PricingFuelSyncUnavailableError,
    );
    expect(repository.createFuelIndex).not.toHaveBeenCalled();
  });
});
