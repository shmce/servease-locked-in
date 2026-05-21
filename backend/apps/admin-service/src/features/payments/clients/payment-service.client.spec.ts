import { ConfigService } from '@nestjs/config';
import {
  PaymentServiceClient,
  PaymentServiceRequestError,
} from './payment-service.client';

describe('PaymentServiceClient', () => {
  it('preserves structured payment-service errors for pricing admin routes', async () => {
    await withFetchResponse(
      503,
      {
        error: {
          code: 'pricing_dependency_unavailable',
          message: 'Pricing service is unavailable.',
          details: {},
        },
      },
      async () => {
        const client = new PaymentServiceClient(configService());

        await expect(client.listPricingRules()).rejects.toMatchObject({
          status: 503,
          code: 'pricing_dependency_unavailable',
          message: 'Pricing service is unavailable.',
        });
      },
    );
  });

  it('keeps unstructured payment-service failures as dependency errors', async () => {
    await withFetchResponse(502, {}, async () => {
      const client = new PaymentServiceClient(configService());

      await expect(client.listPricingRules()).rejects.toThrow(
        'payment_dependency_unavailable',
      );
      await expect(client.listPricingRules()).rejects.not.toBeInstanceOf(
        PaymentServiceRequestError,
      );
    });
  });

  it('calls the payment-owned GasWatch PH fuel sync endpoint', async () => {
    await withFetchResponse(
      200,
      {
        data: {
          id: 'fuel-gaswatch-1',
          region: 'default',
          fuelPricePerLiter: 89.84,
          source: 'gaswatch-ph:diesel:metro-manila-average',
          effectiveAt: '2026-05-19T00:00:00.000Z',
          createdBy: 'admin-1',
          createdAt: '2026-05-19T01:00:00.000Z',
        },
      },
      async () => {
        const client = new PaymentServiceClient(configService());

        const row = await client.syncPricingFuelIndexFromGasWatch({
          adminUserId: 'admin-1',
        });

        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://payment-service.test/internal/pricing/admin/fuel-index/sync',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ adminUserId: 'admin-1' }),
          }),
        );
        expect(row.source).toBe('gaswatch-ph:diesel:metro-manila-average');
      },
    );
  });
});

async function withFetchResponse(
  status: number,
  payload: unknown,
  action: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(payload),
  }) as unknown as typeof fetch;

  try {
    await action();
  } finally {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  }
}

function configService(): ConfigService {
  return {
    get: jest.fn().mockReturnValue('http://payment-service.test'),
  } as unknown as ConfigService;
}
